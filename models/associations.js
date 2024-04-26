const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const { Voting, Candidate } = require("../models/voting");
const User = require("../models/user");
const Vote = require("../models/vote");


Vote.belongsTo(User, { foreignKey: "userId" });
Vote.belongsTo(Candidate, { foreignKey: 'candidateId' });
Vote.belongsTo(Voting, { foreignKey: "votingId" });

User.hasMany(Vote, { foreignKey: "userId" });
User.hasMany(Voting, { foreignKey: "userId" });

Voting.hasMany(Candidate, { foreignKey: "votingId" });
Candidate.belongsTo(Voting, { foreignKey: "votingId" });

Voting.hasMany(Vote, { foreignKey: "votingId" });
Voting.belongsTo(User, { as: 'creator', foreignKey: 'userId' });
Candidate.hasMany(Vote, { foreignKey: 'candidateId' });