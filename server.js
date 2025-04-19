const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const nodemailer = require("nodemailer");
const { collection, userAuthCollection, calendarTasks} = require("./config");
require('dotenv').config();

const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Vite default port
  credentials: true
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Send OTP function
function sendOTP(email, passcode) {
  console.log("Sending OTP to:", email, "Code:", passcode);

  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST || "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER || "your-email@gmail.com",
      pass: process.env.GMAIL_PASS || "your-app-password"
    },
  });

  let mailOptions = {
    from: process.env.GMAIL_USER || "your-email@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${passcode}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("Email error:", err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// Registration route
app.post("/api/signup", async (req, res) => {
  try {
    const data = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      verified: false
    };

    // Check if username already exists
    const existingUser = await collection.findOne({ username: data.username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists - try another" });
    }

    // Check if email has already been registered
    const existingEmail = await collection.findOne({ email: data.email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);
    const userData = await collection.insertOne(data);

    // Create OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const passcode = Math.floor(1000 + Math.random() * 9000); // 4-digit code

    await userAuthCollection.insertOne({
      userID: userData._id.toString(),
      createdAt: new Date(),
      expiresAt: expiresAt,
      secretCode: passcode
    });

    // Send OTP via email
    sendOTP(data.email, passcode);

    res.status(200).json({
      success: true,
      message: "Registration successful",
      email: data.email,
      userId: userData._id.toString()
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    // Check if username exists
    let user = await collection.findOne({ username: req.body.username });

    if (!user) {
      // If username doesn't exist, check if email was input instead
      user = await collection.findOne({ email: req.body.username });
      if (!user) {
        return res.status(401).json({ message: "Username/email or password incorrect" });
      }
    }

    // Check password
    const passwordIsCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: "Username/email or password incorrect" });
    }

    // Check if account is verified
    if (user.verified) {
      // Set cookie with user ID
      res.cookie('userID', user._id.toString(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.status(200).json({
        success: true,
        verified: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });

    } else {

      // Account exists but is not verified - generate new OTP
      const passcode = Math.floor(1000 + Math.random() * 9000);
      
      // Check if there's an existing OTP record
      const existingAuth = await userAuthCollection.findOne({ userID: user._id.toString() });
      
      if (existingAuth) {
        // Update existing record
        await userAuthCollection.updateOne(
          { userID: user._id.toString() },
          {
            $set: {
              secretCode: passcode,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
          }
        );
      } else {
        // Create new OTP record
        await userAuthCollection.insertOne({
          userID: user._id.toString(),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          secretCode: passcode
        });
      }
      
      // Send OTP
      sendOTP(user.email, passcode);
      
      return res.status(200).json({
        success: true,
        verified: false,
        message: "Account requires verification",
        email: user.email,
        userId: user._id.toString()
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Verify OTP route
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Find user by email
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find auth record
    const authRecord = await userAuthCollection.findOne({ userID: user._id.toString() });
    if (!authRecord) {
      return res.status(404).json({ message: "No verification code found" });
    }
    
    // Check if OTP is expired
    const now = new Date();
    if (now > authRecord.expiresAt) {
      return res.status(400).json({ message: "Verification code has expired" });
    }
    
    // Verify OTP
    if (authRecord.secretCode === parseInt(otp, 10)) {
      // Update user to verified
      await collection.updateOne(
        { email },
        { $set: { verified: true } }
      );
      
      return res.status(200).json({
        success: true,
        message: "Account verified successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      return res.status(400).json({ message: "Incorrect verification code" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// Resend OTP route
app.post("/api/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate new OTP
    const passcode = Math.floor(1000 + Math.random() * 9000);
    
    // Update or create auth record
    const existingAuth = await userAuthCollection.findOne({ userID: user._id.toString() });
    
    if (existingAuth) {
      await userAuthCollection.updateOne(
        { userID: user._id.toString() },
        {
          $set: {
            secretCode: passcode,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
          }
        }
      );
    } else {
      await userAuthCollection.insertOne({
        userID: user._id.toString(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        secretCode: passcode
      });
    }
    
    // Send OTP
    sendOTP(email, passcode);
    
    return res.status(200).json({
      success: true,
      message: "Verification code resent"
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset password route
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    
    // Find user by email
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if new password is same as old
    const passwordIsDuplicate = await bcrypt.compare(newPassword, user.password);
    if (passwordIsDuplicate) {
      return res.status(400).json({ message: "New password cannot be the same as old password" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await collection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check auth status route
app.get("/api/auth-status", async (req, res) => {
  if (req.session.user) {
    res.json({ 
      isAuthenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const userID = req.cookies.userID;
    const { name, description, type, time, date } = req.body;
    if (!name || !date || !type) {
      return res.status(400).json({ message: "Missing required task information" });
    }

    const newTask = {
      userID,
      name,
      description: description || '',
      type,
      time: time || '',
      date, // YYYY-MM-DD
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await calendarTasks.insertOne(newTask);

    res.status(201).json({
      success: true,
      message: 'Task saved successfully',
      taskId: result.insertedId
    });
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).json({ message: "Server error while saving task" });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const userID = req.cookies.userID;
    const { date } = req.query;

    const tasks = await calendarTasks.find({ userID, date });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error while fetching tasks" });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const userID = req.cookies.userID;
    const { taskId } = req.params;

    // Check if task exists and belongs to the user
    const task = await calendarTasks.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      userID: userID
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to delete it"
      });
    }

    // Delete the task
    const result = await calendarTasks.deleteOne({
      _id: new mongoose.Types.ObjectId(taskId),
      userID: userID
    });

    if (result.deletedCount === 1) {
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to delete task"
      });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

