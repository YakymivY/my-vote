const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "data", "votes.json");
const Voting = require("../models/voting");

class Vote {
  constructor(votingId, candidateId, userId) {
    this.votingId = votingId;
    this.candidateId = candidateId;
    this.userId = userId;
  }

  static fetchAll() {
    const rawData = fs.readFileSync(filePath);
    const votes = JSON.parse(rawData);

    return votes;
  }

  static async findByVotingIdAndUserId(votingId, userId) {
    const rawData = await new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    const votes = JSON.parse(rawData);
    return votes.find(
      (vote) => vote.votingId == votingId && vote.userId == userId
    );
  }

  async save() {
    let rawData;

    try {
      rawData = await new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } catch (err) {
      console.error(err);
      rawData = "[]";
    }

    const votes = JSON.parse(rawData);
    votes.push(this);

    await new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(votes), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async castVote() {
    // Check if the user has already voted
    const existingVote = await Vote.findByVotingIdAndUserId(
      this.votingId,
      this.userId
    );

    if (existingVote) {
      throw new Error("User has already voted");
    }

    const newVote = new Vote(this.votingId, this.candidateId, this.userId);
    await newVote.save();
  }
}

module.exports = Vote;
