const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");

mongoose
  .connect("mongodb://127.0.0.1:27017/Node")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting DB", err));

// Express session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
const initializePassport = require("./passportconfig");
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

const User = require("./schema");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Register Page Route
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

// Login Page Route
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send("All fields are required!");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists!");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.send("User registered successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
});

// Login Route using Passport
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: false,
  })
);

// Dashboard Route (Protected)
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.send(`Welcome ${req.user.username}!`);
});

// Logout Route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Start Server
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});