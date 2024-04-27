const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Vote = sequelize.define("Vote", {
  votingId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  candidateId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

Vote.hasUserVoted = async (votingId, userId) => {
  return await Vote.findOne({
    where: { votingId, userId }
  });
};

module.exports = Vote;
