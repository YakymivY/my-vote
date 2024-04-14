const express = require('express')
const router = express.Router();

const votingsController = require('../controllers/votings');

router.get('/:id', votingsController.getVoting);

router.post('/:id/vote', votingsController.castVote);

router.post('/:id/close', votingsController.closeVoting);

router.get('/:id/res', votingsController.getResult);

module.exports = router
