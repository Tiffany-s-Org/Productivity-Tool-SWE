const express = require('express');
const bcrypt = require('bcrypt');
const { collection, userAuthCollection } = require("../config");
const session = require("express-session");
const nodemailer = require("nodemailer");
require('dotenv').config();

const app = express();

//convert data into json format
app.use(express.json());
app.use(express.urlencoded({extended:true}));

function sendOTP(email, passcode){
    console.log("Entered sendOTP()");

    const transporter = nodemailer.createTransport({
        host: process.env.GMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        },
    });

    let mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${passcode}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.use(session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/password", (req, res) => {
    res.render("password");
});

app.get("/home", (req, res) => {
    res.render("home");
})

app.get("/otp", (req, res) => {
    sendOTP(req.session.user.email, req.session.user.secretCode);
    res.render("otp");
});

app.post("/otp", async (req, res) => {
    const user = req.session.user;
    if (user){ //check expiration date
        const now = new Date();
        if (now > user.expiresAt) {
            await collection.deleteOne({email: user.email});
            await userAuthCollection.deleteOne({userID: user.userID});
            return res.json({ message: "Code has expired - please register again." });
        }

        //update secretCode if user requests change
        if (user.secretCode === parseInt(req.body.secretCode, 10)){ // otp-input
            await collection.updateOne(
                {email: user.email},
                {$set: {verified:true}}
            );
            user.verified=true;
            return res.redirect("/home");
        } else {
            console.log(user.secretCode);
            console.log(req.body.secretCode);
            res.json({message:"code is incorrect - try again"});
        }
    } else {return res.redirect("/signup");}
});


app.post("/signup", async (req, res) => {
    const data = {username:req.body.username, email:req.body.email, password: req.body.password, verified: false};

    //check if user already exists
    const existingUser = await collection.findOne({username:data.username});
    if (existingUser) {
        return res.json({message:"Username already exists - try another"});
    }

    //check if email has already been registered
    const existingEmail = await collection.findOne({email:data.email});
    if (existingEmail) {
        return res.json({message:"Email already exists - try changing your password idiot!"});
    }

    data.password = await bcrypt.hash(data.password, 10);
    const userData = await collection.insertOne(data);
    console.log(userData);


    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const passcode = Math.floor(Math.random() * 10000);

    const userAuthData = await userAuthCollection.insertOne({
        userID: userData._id,
        createdAt: new Date(),
        expiresAt: expiresAt,
        secretCode: passcode
    })
    console.log(userAuthData);

    req.session.user = {email: data.email, secretCode: passcode };
    req.session.save(() => {
        res.redirect("/otp");
    });
});

app.post("/login", async (req, res) => {
    try {
        //Check if username exists
        let user = await collection.findOne({username:req.body.username});

        if (!user) {
            //if username doesn't exist, check if email was input instead
            user = await collection.findOne({email:req.body.username});
            if (!user) {
                return res.json({message:"username/password incorrect"});
            }
        }

        //Check password
        const passwordIsCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!passwordIsCorrect) {return res.json({message:"password is incorrect"});}

        //check if account is verified
        if (user.verified){
            return res.redirect("/home");
        } else{
            //display message that account exists but is not verified - redirect to OTP page
            const passcode = Math.floor(Math.random() * 10000);
            req.session.user = {email: user.email, secretCode: passcode};
            res.redirect("/otp");
        }
    }
    catch (error){
        console.error(error);
        res.json({message:"Something went wrong :("});
    }
});

//in the future, you should only be allowed to access this page after user gets an email requesting to change password.
app.post("/password", async (req, res) => {
    const pwData = {email:req.body.email, newPassword:req.body.newPassword, newPasswordCheck:req.body.newPasswordCheck};
    // alternatively, we can send an email regardless of existence in the future so its faster - ignore for now
    const user = await collection.findOne({email:pwData.email});
    if (!user) {
        return res.json({message:"incorrect email address"});
    }

    //if the new password matches with the accounts past password, it is a duplicate
    const passwordIsDuplicate = await bcrypt.compare(pwData.newPassword, user.password);
    if (passwordIsDuplicate) {
        return res.json({message:"old password can't be your new one dummy!"});
    }

    //verify that password is input correctly
    if (pwData.newPassword !== pwData.newPasswordCheck){
        return res.json({message:"you did not match the password! Can you do anything right?"});
    }

    //replace old password with new one
    user.password = await bcrypt.hash(pwData.newPassword, 10);
    const userData = await collection.updateOne({email:user.email},{$set:{password:user.password}});
    console.log(userData);
    return res.json({message:"Password Changed!"});
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});