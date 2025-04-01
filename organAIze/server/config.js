const mongoose=require('mongoose');
const connect=mongoose.connect("mongodb+srv://team-yummers:to-my-ta1lf1n@organaize-data.spuit.mongodb.net/login-data");
connect.then(()=>{
    console.log("Database Connected Successfully");
})
.catch(()=>{
    console.log("Database Connection Failure");
})

// user login schema
const loginSchema = new mongoose.Schema({
   username:{type: String, required: true},
    email:{type: String, required: true},
   password:{type: String, required: true},
    verified:{type:Boolean, default:false}
});

console.log("Login Schema active");

// userAuth schema
const userAuthSchema = new mongoose.Schema({
    userID: {type: String, required: true},
    createdAt: {type: Date, required: true},
    expiresAt: {type: Date, required: true},
    secretCode: {type: Number, required: true }
});

console.log("User Auth Schema active");

const userAuthCollection = mongoose.model("userAuths", userAuthSchema);
const collection = mongoose.model("users", loginSchema);
module.exports = {collection, userAuthCollection};
