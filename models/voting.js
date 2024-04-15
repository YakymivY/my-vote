const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "data", "votings.json");

const getVotingsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

function fetchNextId() {
  return new Promise((resolve, reject) => {
    getVotingsFromFile((votings) => {
      let nextId = 1;
      if (votings.length > 0) {
        const lastVote = votings[votings.length - 1];
        nextId = lastVote.id + 1;
      }
      resolve(nextId);
    });
  });
}

class Voting {
  constructor(title, description, createdById, createdBy) {
    console.log(createdById);
    this.candidates = [];
    (async () => {
      try {
        const nextId = await fetchNextId();
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

  addCandidate(name) {
    const candidateId = this.candidates.length + 1;
    const candidate = new Candidate(candidateId, name);
    this.candidates.push(candidate);
  }

  static async closeVoting(votingId, userId, callback) {
    getVotingsFromFile((votings) => {
      const voting = votings.find((voting) => voting.id === parseInt(votingId));
      if (!voting) {
        return reject(new Error("Voting not found"));
      }

      if (voting.createdById !== userId) {
        return reject(new Error("Unauthorized to close this voting"));
      }

      voting.status = "closed";
      fs.writeFile(p, JSON.stringify(votings), (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    });
  }

  static incrementVotes(votingId, candidateId, callback) {
    getVotingsFromFile((votings) => {
      const voting = votings.find((voting) => voting.id === parseInt(votingId));
      if (!voting) {
        callback(new Error(`Voting with ID ${votingId} not found`));
        return;
      }
      if (voting.status !== "active") {
        callback(new Error("Voting is not active"));
      }
      const candidate = voting.candidates.find(
        (candidate) => candidate.id === candidateId
      );
      if (!candidate) {
        callback(
          new Error(
            `Candidate with ID ${candidateId} not found in voting ${votingId}`
          )
        );
        return;
      }
      candidate.voteCount++;
      voting.votes++;
      fs.writeFile(p, JSON.stringify(votings), (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    });
  }

  getCandidateById(candidateId) {
    return this.candidates.find((candidate) => candidate.id === candidateId);
  }

  save() {
    return new Promise((resolve, reject) => {
      getVotingsFromFile((votings) => {
        const votingObject = {
          id: this.id,
          title: this.title,
          description: this.description,
          status: this.status,
          candidates: this.candidates,
          createdBy: this.createdBy,
          createdById: this.createdById,
          votes: this.votes,
        };

        votings.push(votingObject);

        fs.writeFile(
          p,
          JSON.stringify(votings, (key, value) => {
            if (key === "candidates") {
              return value.map((candidate) => ({
                id: candidate.id,
                name: candidate.name,
                voteCount: candidate.voteCount,
              }));
            }
            return value;
          }),
          (err) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    });
  }

  static fetchAll(cb) {
    getVotingsFromFile(cb);
  }

  static fetchNextId(cb) {
    getVotingsFromFile((votings) => {
      let nextId = 1;
      if (votings.length > 0) {
        const lastVote = votings[votings.length - 1];
        nextId = lastVote.id + 1;
      }
      cb(nextId);
    });
  }

  static fetchById(id, cb) {
    getVotingsFromFile((votings) => {
      const vote = votings.find((vote) => vote.id === id);
      cb(vote);
    });
  }
}

class Candidate {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.voteCount = 0;
  }

  incrementVoteCount() {
    this.voteCount++;
  }
}

module.exports = { Voting, getVotingsFromFile };
