const db = require('../util/database')

class Vote {
  constructor(votingId, candidateId, userId) {
    this.votingId = votingId;
    this.candidateId = candidateId;
    this.userId = userId;
  }

  static fetchByVotingIdAndUserId(votingId, userId){
    return db.execute(`SELECT * FROM votes WHERE voting_id = ? AND user_id = ?`, [votingId, userId])
  }

  static async hasUserVoted(votingId, userId) {
    const [rows] = await db.execute(
      `SELECT * FROM votes WHERE voting_id = ? AND user_id = ?`,
      [votingId, userId]
    );

    return rows.length > 0;
  }

}

module.exports = Vote;
