const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const votingsController = require("../controllers/votings");

router.get("/", (req, res) => {
  const token = req.cookies.token ? req.cookies.token : null;
  res.render("newpoll", { req, userId:token });
});

router.post("/add-voting", auth, votingsController.addVoting);

module.exports = router;
