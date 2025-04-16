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

//calendar-task schema
const taskSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    type: {
        type: String,
        enum: ['homework', 'lecture/meetings', 'general', 'free time', 'other'],
        required: true
    },
    time: String, // store as "3:00 PM"
    date: { type: String, required: true }, // "YYYY-MM-DD"
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

console.log("Calendar-task Schema active");

const userAuthCollection = mongoose.model("userAuths", userAuthSchema);
const collection = mongoose.model("users", loginSchema);
const calendarTasks = mongoose.model("tasks", taskSchema);
module.exports = {collection, userAuthCollection, calendarTasks};
