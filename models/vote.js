const db = require("../util/database");

class Vote {
  constructor(votingId, candidateId, userId) {
    this.votingId = votingId;
    this.candidateId = candidateId;
    this.userId = userId;
  }

  static fetchByVotingIdAndUserId(votingId, userId) {
    return db.execute(
      `SELECT * FROM votes WHERE voting_id = ? AND user_id = ?`,
      [votingId, userId]
    );
  }

  static async hasUserVoted(votingId, userId) {
    const [rows] = await db.execute(
      `SELECT * FROM votes WHERE voting_id = ? AND user_id = ?`,
      [votingId, userId]
    );

    return rows.length > 0;
  }

  static async retractVote(votingId, userId) {
    const { Voting, Candidate } = require("../models/voting");
    return new Promise(async (resolve, reject) => {
      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const voting = Voting.fetchById(votingId);
        if(!voting || voting.status=="closed"){
          reject(new Error("Voting not found or closed"));
          return;
        }

        const [existingVoteRows] = await Vote.fetchByVotingIdAndUserId(
          votingId,
          userId
        );

        if (!existingVoteRows.length) {
          reject(new Error("Vote not found"));
          return;
        }
        const candidateId = existingVoteRows[0].candidate_id;

        await connection.execute(
          `DELETE FROM votes WHERE voting_id = ? AND user_id = ?`,
          [votingId, userId]
        );

        await connection.execute(
          `UPDATE candidates SET votes_num = votes_num - 1 WHERE id = ?`,
          [candidateId]
        );

        await connection.execute(
          `UPDATE votings SET votes_num = votes_num - 1 WHERE id = ?`,
          [votingId]
        );

        await connection.commit();
        resolve();
      } catch (err) {
        if (connection) {
          await connection.rollback();
        }
        console.error(err);
        reject(err);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    });
  }
}

module.exports = Vote;
