const db = require('../util/database')

class Vote {
  constructor(votingId, candidateId, userId) {
    this.votingId = votingId;
    this.candidateId = candidateId;
    this.userId = userId;
  }

  static fetchAll() {
    // synchronous code
    const rawData = fs.readFileSync(filePath);
    const votes = JSON.parse(rawData);

    return votes;
  }

  static fetchByVotingIdAndUserId(votingId, userId){
    return db.execute(`SELECT * FROM votes WHERE voting_id = ? AND user_id = ?`, [votingId, userId])
  }


  save() {
    const votes = Vote.fetchAll();
    votes.push(this);
    fs.writeFileSync(filePath, JSON.stringify(votes));
  }

  castVote() {
    const existingVote = Vote.findByVotingIdAndUserId(
      this.votingId,
      this.userId
    );

    if (existingVote) {
      throw new Error("User has already voted");
    }

    const newVote = new Vote(this.votingId, this.candidateId, this.userId);
    newVote.save();
  }
}

module.exports = Vote;
