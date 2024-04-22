const express = require("express");
const router = express.Router();
const Session = require("../models/session");

const verifySession = async (req, res, next) => {
  console.log(req.body)
  const token = req.cookies.token;
  console.log(req.headers)
  console.log(token)
  let session = await Session.fetchByToken(token);
  session = session[0][0]

  console.log("Session:", session)

  if (!session || session.expires_at < Date.now()) {
    console.log("Error: expired session")
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.cookies.userId != session.user_id) {
    console.log(req.cookies.userId)
    console.log(session.user_id)
    console.log("Error: userId in cookies does not match with session user id")
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user_id = session.user_id;
  next();
}

module.exports = verifySession;