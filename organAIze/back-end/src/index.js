const express=require("express")
const path=require("path")
const app=express()
//const hbs=require("hbs")
const userLoginCollection=require("./mongodb")

const templatePath = path.join(__dirname, '../templates') // try '../templates' if not working

app.use(express.json())
app.set("view engine", "hbs")
app.set("views", templatePath)
app.use(express.urlencoded({ extended: false }))

app.get("/",(req,res)=>{
    res.render("login")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.post("/signup",async (req,res)=>{
    const userData={
        name:req.body.name,
        password:req.body.password
    }
await userLoginCollection.insertOne([userData]); //insertMany results in problems!
res.render("home")
})

app.post("/login",async (req,res)=>{
    try {
        const check = await userLoginCollection.findOne({name: req.body.name})
        if (check.password === req.body.password) {
            res.render("home")
        } else {
            res.send("wrong password")
        }
    } catch {
        res.send("wrong username and/or password")
    }
})

app.listen(3000, ()=>{
    console.log("Server started on port 3000")
})