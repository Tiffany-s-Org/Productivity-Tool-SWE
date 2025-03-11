const mongoose = require("mongoose")

//name of our database: "userDatabase"
mongoose.connect("mongodb://localhost:27017/user-login-database")
.then(()=>{
    console.log("MongoDB Connected")
})
.catch(()=>{
    console.log("MongoDB Failed to Connect")
})

const loginSchema = new mongoose.Schema({
    name:{type:String,required:true},
    password:{type:String,required:true}
})

const userLoginCollection = new mongoose.model("userLoginCollection",loginSchema)
module.exports = userLoginCollection