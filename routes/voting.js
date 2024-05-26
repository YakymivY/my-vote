const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const votingsController = require("../controllers/votings");

router.get("/:id", votingsController.getVoting);

router.post("/:id/vote", auth, votingsController.castVote);

router.put("/:id/close", auth, votingsController.closeVoting);

router.put("/:id/open", auth, votingsController.openVoting);

router.post("/:id/retract", auth, votingsController.retractVote);

router.delete("/:id", auth, votingsController.deleteVoting);

router.get("/:id/res", votingsController.getResult);

module.exports = router;
