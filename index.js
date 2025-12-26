const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");
const User = require("./models/user");
const userWork = require("./models/userWork");

mongoose
  .connect("mongodb://127.0.0.1:27017/ToDoDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const session = require("express-session");
app.use(
  session({
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.username = req.session.username;
  next();
});

app.get("/", (req, res) => {
  res.send(`This is root directory`);
});

app.get("/signUp", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/signUp", async (req, res) => {
  console.log(req.body.username);
  let user1 = await User.findOne({ email: req.body.email });
  if (!user1) {
    await User.create({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    res.redirect("/login");
  } else {
    res.send("User exists please signup again, do reload!");
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

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

app.get("/user", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // today work
  const work = await userWork.findOne({
    userId: req.session.userId,
    date: today,
  });

  // last 7 days date
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  last7Days.setHours(0, 0, 0, 0);

  // works of last 7 days
  const last7DaysWorks = await userWork.find({
    userId: req.session.userId,
    date: { $gte: last7Days },
  });

  let completedLast7Days = 0;
  let totalLast7Days = 0;

  last7DaysWorks.forEach((w) => {
    totalLast7Days += w.tasks.length;
    completedLast7Days += w.tasks.filter((t) => t.isCompleted).length;
  });

  //last 30 days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate()-30);
  last30Days.setHours(0, 0, 0, 0);

  //works for last 30 days
  const last30daysWorks = await userWork.find({
    userId: req.session.userId,
    date: {$gte: last30Days},
  })

  let completedLast30Days = 0;
  let totalLast30Days = 0;

  last30daysWorks.forEach((w)=>{
    totalLast30Days += w.tasks.length;
    completedLast30Days += w.tasks.filter((t) => t.isCompleted).length;
  });

  res.render("homePage.ejs", {
    work,
    completedLast7Days,
    totalLast7Days,
    completedLast30Days,
    totalLast30Days
  });
});

app.post("/addTodo", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("User not logged in");
  }
  const user1 = await User.findById(req.session.userId);
  if (!user1) {
    return res.status(404).send("User not found");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let work = await userWork.findOne({
    userId: user1._id,
    date: today,
  });

  if (!work) {
    work = new userWork({
      userId: user1._id,
      date: today,
      tasks: [],
    });
  }

  work.tasks.push({
    title: req.body.todos,
    isCompleted: false,
  });

  await work.save();
  console.log("Saved work:", work);
  res.redirect("/user");
});

app.post("/toggleTodo", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Not logged in");
  }

  const { taskId } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const work = await userWork.findOne({
    userId: req.session.userId,
    date: today,
  });

  if (!work) {
    return res.redirect("/user");
  }

  const task = work.tasks.id(taskId);
  if (!task) {
    return res.redirect("/user");
  }

  task.isCompleted = !task.isCompleted;
  await work.save();

  res.redirect("/user");
});

app.get("/tasks", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ tasks: [] });
  }

  const date = new Date(req.query.date);
  date.setHours(0, 0, 0, 0);

  const work = await userWork.findOne({
    userId: req.session.userId,
    date: date,
  });

  res.json({
    tasks: work ? work.tasks : [],
  });
});


app.listen(port, (req, res) => {
  console.log("Connected to port 3000");
});
