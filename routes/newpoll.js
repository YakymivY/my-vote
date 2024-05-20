const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const votingsController = require("../controllers/votings");

router.get("/", (req, res) => {
  const tokenString = req.headers["authorization"]
    ? req.headers["authorization"]
    : null;
  const token = tokenString && tokenString.split(" ")[1];
  res.status(200).json({ userId: token });
});

router.post("/add-voting", auth, votingsController.addVoting);

module.exports = router;
