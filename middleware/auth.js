const express = require("express");
const router = express.Router();
const Session = require("../models/session");

const verifySession = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("Error: empty token");
    return res.status(401).send("Unauthorized");
  }
  try {
    const session = await Session.fetchByToken(token);
    if (!session || session.expiresAt < Date.now()) {
      console.log("Error: expired session");
      return res.status(401).send("Unauthorized");
    }

    if (req.cookies.userId != session.userId) {
      console.log(req.cookies.userId);
      console.log(session.userId);
      console.log(
        "Error: userId in cookies does not match with session userId"
      );
      return res.status(401).send("Unauthorized");
    }

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = verifySession;
