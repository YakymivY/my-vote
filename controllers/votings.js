const {Voting, getVotingsFromFile} = require("../models/voting");
const Vote = require("../models/vote");

exports.getVoting = (req, res, next) => {
  const votingId = parseInt(req.params.id);
  const authorId = req.cookies.authorId;
  Voting.fetchById(votingId, (voting) => {
    if (!voting) {
      return res.status(404).send("Voting not found");
    }
    console.log(voting);
    res.render("voting", {voting, authorId});
  });
};

exports.addVoting = async (req, res, next) => {
  const authorId = req.cookies.authorId;
  const authorName = req.cookies.authorName;
  const voting = new Voting(
    req.body.surveyTitle,
    req.body.surveyDescription,
    authorId,
    authorName
  );

  for (const option of req.body.options) {
    voting.addCandidate(option);
  }

  await voting.save();

  console.log(`lol: ${voting.id}`);
  res.redirect(`/voting/${voting.id}`);
};

exports.castVote = async (req, res, next) => {
  console.log('Received request:', req.method, req.url);
  console.log('Request body:', req.body);

  const votingId = req.params.id;
  const candidateId = parseInt(req.body.candidateId);
  const userId = req.cookies.authorId;

  if (!candidateId) {
    res.status(500).send({ message: 'Incorrect candidate' });
  }

  try {
    const voting = await Voting.findById(votingId);

    if (!voting) {
      return res.status(404).send('Voting not found');
    }

    if (voting.status !== 'active') {
      return res.status(400).send('Voting is not active' );
    }

    const vote = new Vote(votingId, candidateId, userId);
    await vote.castVote();
    Voting.incrementVotes(votingId, candidateId, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to increment votes');
      }
      console.log('Votes incremented successfully');
      res.status(200).send('Vote cast successfully');
    });
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
};


exports.castVote = async (req, res, next) => {
    console.log('Received request:', req.method, req.url);
    console.log('Request body:', req.body);
  
    const votingId = req.params.id;
    const candidateId = parseInt(req.body.candidateId);
    const userId = req.cookies.authorId;

    if(!candidateId){
        res.status(500).send({ message: 'Incorrect candidate' });
    }
  
    const vote = new Vote(votingId, candidateId, userId);
  
    try {
        Voting.incrementVotes(votingId, candidateId, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Failed to increment votes');
          }
          console.log('Votes incremented successfully');
          res.status(200).send('Vote cast successfully');
        });
        await vote.castVote();
      } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
      }
  }

  exports.closeVoting = async (req, res, next) => {
    const votingId = req.params.id;
    const userId = req.cookies.authorId;
    try {
      Voting.closeVoting(votingId, userId, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error closing voting');
        }
        res.status(200).send('Voting closed successfully');
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error closing voting');
    }
    res.redirect(`/`);
  };
  