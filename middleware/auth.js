const express = require("express");
const router = express.Router();
const Session = require("../models/session");

const verifySession = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Error: empty token. Please log in.");
  }
  let session = await Session.fetchByToken(token);
  session = session[0][0];
  if (!session || session.expires_at < Date.now()) {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(401).send("Error: expired session. Please log in again.");
  }
  req.userId = session.user_id;
  next();
};

module.exports = verifySession;
