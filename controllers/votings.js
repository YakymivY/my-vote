const { Voting, Candidate } = require("../models/voting");
const Vote = require("../models/vote");
const Session = require("../models/session");

exports.getVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const token = req.cookies.token ? req.cookies.token : null
  let userId = null;
  if (token){
    let session = await Session.fetchByToken(token);
    session = session[0][0];
    if (session){
      userId = session.user_id;
    }
  }
  Promise.all([
    Voting.fetchVotingwithCreatorById(votingId),
    Candidate.fetchByVotingId(votingId),
    Vote.fetchByVotingIdAndUserId(votingId, userId),
  ])
    .then(([[rows, fieldData], [candidates], [voteRows, voteFields]]) => {
      if (!rows.length) {
        return res.status(404).send("Voting not found");
      }
      const voting = rows[0];
      const creatorName = voting.creator_name;
      res.render("voting", {
        voting,
        candidates,
        vote: voteRows,
        userId:userId,
        creatorName,
        req,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("An error occurred while fetching the data");
    });
};

exports.addVoting = async (req, res, next) => {
  console.log(req.body)
  try {
    const votingId = await Voting.createWithCandidates(
      req.body.surveyTitle,
      req.body.surveyDescription,
      req.userId,
      req.body.options
    );
    res.redirect(`/voting/${votingId}`);
  } catch (err) {
    console.error(err);
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
    res.status(500).send(err);
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
  const token = req.cookies.token ? req.cookies.token : null;
  Promise.all([
    Voting.fetchVotingwithCreatorById(votingId),
    Candidate.fetchByVotingId(votingId),
  ])
    .then(([[rows, fieldData], [candidates]]) => {
      if (!rows.length) {
        return res.status(404).send("Voting not found");
      }
      const voting = rows[0];
      const creatorName = voting.creator_name;
      res.render("votingRes", { voting, candidates, creatorName, req, userId:token});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
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
  
}