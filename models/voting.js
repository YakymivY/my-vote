const db = require("../util/database");
const Vote = require("../models/vote");

class Voting {
  constructor(title, description, createdById, createdBy) {
    this.candidates = [];
    (async () => {
      try {
        const nextId = await Voting.fetchNextId();
        this.id = nextId;
        this.title = title;
        this.description = description;
        this.status = "active";
        this.createdById = createdById;
        this.createdBy = createdBy;
        this.votes = 0;
      } catch (err) {
        console.error(err);
      }
    })();
  }

  static async incrementVotes(votingId, candidateId, userId) {
    // demonstrates transaction confirmation in case of success and transaction rollback in case of failure
    return new Promise(async (resolve, reject) => {
      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const hasVoted = await Vote.hasUserVoted(votingId, userId);
        if (hasVoted) {
          reject(new Error("User has already voted"));
          return;
        }

        const [votingRows] = await Voting.fetchById(votingId);

        if (!votingRows.length) {
          reject(
            new Error(`Voting with ID ${votingId} not found or not active`)
          );
          return;
        }

        const [candidateRows] = await connection.execute(
          `SELECT * FROM candidates WHERE voting_id = ? AND id = ? FOR UPDATE`,
          [votingId, candidateId]
        );

        if (!candidateRows.length) {
          reject(
            new Error(
              `Candidate with ID ${candidateId} not found in voting ${votingId}`
            )
          );
          return;
        }

        await connection.execute(
          `INSERT INTO votes (voting_id, candidate_id, user_id) VALUES (?, ?, ?)`,
          [votingId, candidateId, userId]
        );

        await connection.execute(
          `UPDATE candidates SET votes_num = votes_num + 1 WHERE id = ?`,
          [candidateId]
        );

        await connection.execute(
          `UPDATE votings SET votes_num = votes_num + 1 WHERE id = ?`,
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

  static async createWithCandidates(
    title,
    description,
    createdById,
    candidates
  ) {
    return new Promise(async (resolve, reject) => {
      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const result = await connection.execute(
          `INSERT INTO votings (title, description, user_id) VALUES (?, ?, ?)`,
          [title, description, createdById]
        );

        const votingId = result[0].insertId;

        const candidatePromises = candidates.map((name) => {
          return Candidate.create(votingId, name, connection);
        });

        await Promise.all(candidatePromises);

        await connection.commit();
        resolve(votingId);
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

  static async closeVoting(votingId, userId) {
    return new Promise(async (resolve, reject) => {
      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [votingRows] = await Voting.fetchById(votingId, connection);

        if (!votingRows.length) {
          reject(new Error("Voting not found"));
          return;
        }

        if (votingRows[0].user_id != userId) {
          reject(new Error("Unauthorized to close this voting"));
          return;
        }

        await connection.execute(
          `UPDATE votings SET status = 'closed' WHERE id = ?`,
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

  static async openVoting(votingId, userId) {
    return new Promise(async (resolve, reject) => {
      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [votingRows] = await Voting.fetchById(votingId, connection);

        if (!votingRows.length) {
          reject(new Error("Voting not found"));
          return;
        }

        if (votingRows[0].user_id != userId) {
          reject(new Error("Unauthorized to open this voting"));
          return;
        }

        await connection.execute(
          `UPDATE votings SET status = 'active' WHERE id = ?`,
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

  static fetchAll() {
    return db.execute(
      `SELECT votings.*, users.name AS creator_name
       FROM votings
       INNER JOIN users ON votings.user_id = users.id
       ORDER BY votings.created_at DESC`
    );
  }

  static fetchVotingwithCreatorById(id) {
    return db.execute(
      `SELECT votings.*, users.name AS creator_name
       FROM votings
       INNER JOIN users ON votings.user_id = users.id
       WHERE votings.id = ?`,
      [id]
    );
  }

  static fetchById(id) {
    return db.execute(
      `SELECT *
       FROM votings
       WHERE votings.id = ?`,
      [id]
    );
  }
}

class Candidate {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.votes = 0;
  }

  static fetchByVotingId(id) {
    return db.execute(`SELECT * FROM candidates WHERE voting_id = ?`, [id]);
  }

  static async create(votingId, name, connection) {
    return connection.execute(
      `INSERT INTO candidates (voting_id, name) VALUES (?, ?)`,
      [votingId, name]
    );
  }
}

module.exports = { Voting, Candidate };
