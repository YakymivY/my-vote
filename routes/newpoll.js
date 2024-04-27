const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const votingsController = require("../controllers/votings");

router.get("/", (req, res) => {
  userId = req.cookies.userId;
  res.render("newpoll", { req, userId });
});

router.post("/add-voting", auth, votingsController.addVoting);

module.exports = router;
