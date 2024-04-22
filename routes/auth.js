const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Session = require("../models/session");
const { v4: uuidv4 } = require('uuid');
const auth = require("../middleware/auth")

router.post("/register", async (req, res) => {
  try {
    const {name, login, password } = req.body;
    console.log(name, login, password)

    const existingUser = await User.fetchByLogin(login);
    console.log(existingUser[0])
    if (existingUser[0].length) {
      return res.status(409).json({ message: "User with that login already exists" });
    }

    const newUser = await User.create(name, login, password);
    res.status(201).json({ message: "User created", userId: newUser.insertId });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log( "login:", req.body)

    const user = await User.fetchByLogin(login);
    console.log(user[0][0])
    console.log(user[0][0].id)

    if (!user[0][0] || !(await User.comparePassword(password, user[0][0].password))) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 1000*360*10*24).toISOString().slice(0, 19).replace('T', ' ');
    await Session.create(user[0][0].id, token, expires_at);

    res.cookie('userId', user[0][0].id, {
      httpOnly: true,
      secure: true, // Set to true in production to only send the cookie over HTTPS
      sameSite: 'strict', // Set to 'strict' to only send the cookie with requests originating from the same site
      maxAge: 24 * 60 * 60 * 1000 // Cookie expires after 24 hours
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Set to true in production to only send the cookie over HTTPS
      sameSite: 'strict', // Set to 'strict' to only send the cookie with requests originating from the same site
      maxAge: 24 * 60 * 60 * 1000 // Cookie expires after 24 hours
    });

    res.status(200).json({ message: "Logged in"});
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error logging in" });
  }
});


router.get("/login", async (req, res) => {
  const userId = req.cookies.userId ? req.cookies.userId : null;
    res.render("auth/login", { req, userId});
})

router.get("/register", async (req, res) => {
  const userId = req.cookies.userId ? req.cookies.userId : null;
    res.render("auth/register", { req, userId });
})

router.post("/logout", auth, async (req, res) => {
  console.log("Cookies:", req.cookies.userId)
  if(!req.cookies.userId){
    res.status(500).json({ message: "Log out failed" });
    return
  }
  await Session.deleteByUser(req.cookies.userId);
  res.cookie('userId', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.status(200).json({ message: "Logged out" });
});

module.exports = router;
