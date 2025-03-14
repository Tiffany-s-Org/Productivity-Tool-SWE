const mongoose=require('mongoose');
const connect=mongoose.connect("mongodb+srv://team-yummers:to-my-ta1lf1n@organaize-data.spuit.mongodb.net/login-data");

connect.then(()=>{
    console.log("Database Connected Successfully");
})
.catch(()=>{
    console.log("Database Connection Failure");
})

const loginSchema = new mongoose.Schema({
   username:{type: String, required: true},
    email:{type: String, required: true},
   password:{type: String, required: true}
});

const collection = new mongoose.model("users", loginSchema);
module.exports = collection;