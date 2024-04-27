const { Voting, Candidate } = require("../models/voting");
const Vote = require("../models/vote");
const User = require("../models/user");

exports.getVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId ? req.cookies.userId : null;

  try {
    const voting = await Voting.findByPk(votingId, {
      include: [{ model: User, as: "creator" }],
    });
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    const candidates = await Candidate.findAll({ where: { votingId } });
    let vote;
    if (userId) {
      vote = await Vote.findOne({
        where: { votingId: votingId, userId: userId },
      });
    }
    vote = vote ? vote.dataValues : undefined;
    res.render("voting", {
      voting,
      candidates,
      vote,
      userId,
      req,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the data");
  }
};

exports.addVoting = async (req, res, next) => {
  const title = req.body.surveyTitle;
  const description = req.body.surveyDescription;
  const options = req.body.options;
  const userId = req.userId;
  try {
    result = await Voting.createWithCandidates(
      title,
      description,
      userId,
      options
    );
    res.redirect(`/voting/${result.dataValues.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving voting");
  }
};

exports.castVote = async (req, res, next) => {
  const votingId = req.params.id;
  const candidateId = req.body.candidateId;
  const userId = req.userId;
  try {
    await Voting.incrementVotes(votingId, candidateId, userId);
    res.status(200).send("Vote casted successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
};

exports.closeVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.userId;
  try {
    await Voting.closeVoting(votingId, userId);
    res.status(200).send("Voting closed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while closing the voting");
  }
};

exports.openVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.userId;
  try {
    await Voting.openVoting(votingId, userId);
    res.status(200).send("Voting opened successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error opening voting");
  }
};

exports.getResult = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId ? req.cookies.userId : null;

  try {
    const voting = await Voting.findByPk(votingId, {
      include: [{ model: User, as: "creator" }],
    });
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    const candidates = await Candidate.findAll({ where: { votingId } });
    res.render("votingRes", {
      voting,
      candidates,
      userId,
      req,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the data");
  }
};

exports.retractVote = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.userId;
  try {
    await Vote.retractVote(votingId, userId);
    res.status(200).send("Vote retracted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retracting the vote");
  }
};

exports.deleteVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.userId;
  try {
    await Voting.deleteVoting(votingId, userId);
    res.redirect(`/`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting the voting");
  }
};
