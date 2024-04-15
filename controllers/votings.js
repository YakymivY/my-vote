const { Voting, getVotingsFromFile } = require("../models/voting");
const Vote = require("../models/vote");

exports.getVoting = async (req, res, next) => {
  const votingId = parseInt(req.params.id);
  const userId = req.cookies.userId;
  const vote = Vote.findByVotingIdAndUserId(votingId, userId);
  Voting.fetchById(votingId, (voting) => {
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    console.log(voting);
    console.log(vote);
    res.render("voting", { voting, vote, userId, req });
  });
};

exports.addVoting = async (req, res, next) => {
  const userId = req.cookies.userId;
  const userName = req.cookies.userName;
  const voting = new Voting(
    req.body.surveyTitle,
    req.body.surveyDescription,
    userId,
    userName
  );

  for (const option of req.body.options) {
    voting.addCandidate(option);
  }

  await voting.save();

  console.log(`lol: ${voting.id}`);
  res.redirect(`/voting/${voting.id}`);
};

exports.castVote = async (req, res, next) => {
  console.log("Received request:", req.method, req.url);
  console.log("Request body:", req.body);

  const votingId = req.params.id;
  const candidateId = parseInt(req.body.candidateId);
  const userId = req.cookies.userId;

  if (!candidateId) {
    res.status(500).send({ message: "Incorrect candidate" });
  }

  const vote = new Vote(votingId, candidateId, userId);

  try {
    vote.castVote();
    Voting.incrementVotes(votingId, candidateId, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Failed to increment votes");
      }
      console.log("Votes incremented successfully");
      res.status(200).send("Vote cast successfully");
    });
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
};

exports.closeVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId;
  try {
    Voting.closeVoting(votingId, userId, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error closing voting");
      }
      res.status(200).send("Voting closed successfully");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error closing voting");
  }
  res.redirect(`/`);
};

exports.openVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId;
  try {
    Voting.openVoting(votingId, userId, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error opening voting");
      }
      res.status(200).send("Voting opened successfully");
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error opening voting");
  }
  res.redirect(`/`);
};

exports.getResult = async (req, res, next) => {
  const votingId = parseInt(req.params.id);
  console.log(`lol: ${votingId}`);
  const userId = req.cookies.userId;
  Voting.fetchById(votingId, (voting) => {
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    const userId = req.cookies.userId;

    if (userId != voting.createdById) {
      res.status(403).send("Unathorized");
    }
    console.log(voting);
    res.render("votingRes", { voting });
  });
};
