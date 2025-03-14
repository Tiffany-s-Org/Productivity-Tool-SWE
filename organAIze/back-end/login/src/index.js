const express = require('express');
//const path = require('path');
const bcrypt = require('bcrypt');
const collection = require("./config");

const app = express();

//convert data into json format
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//use EJS as the view engine
app.set('view engine', 'ejs');

//use could use this to link your CSS files onto the backend if you want
//app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/password", (req, res) => {
   res.render("password");
});

app.post("/signup", async (req, res) => {
    const data = {username:req.body.username, email:req.body.email, password: req.body.password};

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

    //hash the password using bcrypt
    data.password = await bcrypt.hash(data.password, 10);
    //save data
    const userData = await collection.insertOne(data);
    console.log(userData);
    return res.json({message:"Registration successful!"});
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
        if (passwordIsCorrect) {return res.render("home");}
        else {return res.json({message:"password is incorrect"});}
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