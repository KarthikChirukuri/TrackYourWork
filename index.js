const express = require('express');
const app = express();
const port = 3000;

const mongoose = require('mongoose');
const User = require('./models/user');
const userWork = require('./models/userWork');

mongoose.connect("mongodb://127.0.0.1:27017/ToDoDB")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.set("view engine", "ejs");
		
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const session = require("express-session");
app.use(session({
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true
}));

app.get("/", ((req,res)=>{
    res.send(`This is root directory`);
}));

app.get("/signUp", (req,res)=>{
    res.render("signUp.ejs");
})

app.post("/signUp", async (req,res)=>{
    console.log(req.body.username);
    let user1 = await User.findOne({email: req.body.email});
    if(!user1){
        await User.create({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password
        })

        res.redirect("/login");
    }else{
        res.send("User exists please signup again, do reload!");
    }
})

app.get("/login", (req,res)=>{
    res.render("login.ejs");
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user1 = await User.findOne({ email });
  if (!user1) {
    return res.send("User does not exist");
  }
  
  //change password later using not created just for testing purpose
  if (user1.password !== password) {
    return res.send("Wrong password");
  }
  req.session.userId = user1._id;
  req.session.username = user1.name;
  res.redirect("/user");
});


app.get("/user", (req,res)=>{
    res.render("homePage.ejs");
})

app.post("/addTodo", (req,res)=>{
    console.log(req.body.todos);
    if(req.session.username){
        const user1 = user.findOne({name: req.session.username});

    }
    res.send("added task!");
})

app.listen(port, (req,res)=>{
    console.log("Connected to port 3000");
})