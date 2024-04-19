const { Voting, getVotingsFromFile } = require("../models/voting");
const Vote = require("../models/vote");

exports.getVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId;
  try {
    const vote = Vote.findByVotingIdAndUserId(votingId, userId);
    const voting = await Voting.fetchById(votingId);
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    res.render("voting", { voting, vote, userId, req });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the voting");
  }
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
  if(!req.body.options || req.body.options.length < 2){
    return res.status(400).send("Error: Amount of candidates should be more than 1");
  }
  console.log(req.body.options)

  for (const option of req.body.options) {
    voting.addCandidate(option);
  }
  try {
    await voting.save();
    res.redirect(`/voting/${voting.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving voting");
  }
};

exports.castVote = async (req, res, next) => {
  const votingId = req.params.id;
  const candidateId = req.body.candidateId;
  const userId = req.cookies.userId;

  const vote = new Vote(votingId, candidateId, userId);

    const existingVote = Vote.findByVotingIdAndUserId(votingId, userId);
    console.log(existingVote);
    if (existingVote) {
      return res.status(400).send("User has already voted");
    }

    try {
      await Voting.incrementVotes(votingId, candidateId);
      vote.castVote();
      res.status(200).send("Vote casted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while casting the vote");
    }
}

exports.closeVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId;
  try {
    await Voting.closeVoting(votingId, userId);
    res.status(200).send("Voting closed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error closing voting");
  }
};

exports.openVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const userId = req.cookies.userId;
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
  try {
    const voting = await Voting.fetchById(votingId);
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    // results are available to all
    // const userId = req.cookies.userId;
    // if (userId != voting.createdById) {
    //   res.status(403).send("Unathorized");
    // }
    res.render("votingRes", { voting, req });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the voting");
  }
};
