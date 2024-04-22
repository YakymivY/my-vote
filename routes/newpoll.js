const express = require("express");
const router = express.Router();

const votingsController = require("../controllers/votings");

router.get("/", (req, res) => {
  userId = req.cookies.userId
  res.render("newpoll", { req, userId });
});

router.post("/add-voting", votingsController.addVoting);

module.exports = router;
