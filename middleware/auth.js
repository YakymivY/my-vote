const express = require("express");
const router = express.Router();
const Session = require("../models/session");

const verifySession = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("Error: empty token");
    return res.status(401).send("Unauthorized");
  }
  let session = await Session.fetchByToken(token);
  session = session[0][0];
  if (!session || session.expires_at < Date.now()) {
    console.log("Error: expired session");
    return res.status(401).send("Unauthorized");
  }

  if (req.cookies.userId != session.user_id) {
    console.log(req.cookies.userId);
    console.log(session.user_id);
    console.log("Error: userId in cookies does not match with session user id");
    return res.status(401).send("Unauthorized");
  }

  req.user_id = session.user_id;
  next();
};

module.exports = verifySession;
