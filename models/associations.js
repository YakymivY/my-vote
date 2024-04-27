const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const { Voting, Candidate } = require("../models/voting");
const User = require("../models/user");
const Vote = require("../models/vote");
const Session = require("../models/session");

User.hasMany(Vote, { foreignKey: "userId" });
User.hasMany(Voting, { foreignKey: "userId" });

Voting.hasMany(Vote, { foreignKey: "votingId" });
Voting.belongsTo(User, { as: "creator", foreignKey: "userId" });
Candidate.hasMany(Vote, { foreignKey: "candidateId" });

User.hasMany(Session, { foreignKey: "userId" });
Session.belongsTo(User, { foreignKey: "userId" });

Voting.hasMany(Candidate, { foreignKey: "votingId", onDelete: "CASCADE" }); // automatically delete all the child records that reference the parent record when the parent record is deleted
Candidate.belongsTo(Voting, { foreignKey: "votingId", onDelete: "CASCADE" });
Vote.belongsTo(Voting, { foreignKey: "votingId", onDelete: "CASCADE" });
Vote.belongsTo(Candidate, { foreignKey: "candidateId", onDelete: "CASCADE" });
Vote.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
