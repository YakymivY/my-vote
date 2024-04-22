const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth")
const votingsController = require("../controllers/votings");

router.get("/:id", votingsController.getVoting);

router.post("/:id/vote", auth, votingsController.castVote);

router.post("/:id/close", auth, votingsController.closeVoting);

router.post("/:id/open", auth, votingsController.openVoting);

router.post("/:id/retract", auth, votingsController.retractVote);

router.get("/:id/res", votingsController.getResult);

module.exports = router;
