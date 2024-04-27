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

Vote.findbyVotingIdandUserId = async (votingId, userId) => {
  return await Vote.findOne({
    where: { votingId, userId },
  });
};

Vote.destroyVotes = async (votingId, transaction) => {
  return await Vote.destroy({
    where: { votingId: votingId },
    transaction,
  });
};

Vote.retractVote = async (votingId, userId) => {
  const { Voting, Candidate } = require("../models/voting");
  const transaction = await sequelize.transaction();

  try {
    const vote = await Vote.findbyVotingIdandUserId(votingId, userId);

    if (!vote) {
      throw new Error("Vote not found");
    }

    const candidateId = vote.candidateId;

    await vote.destroy({ transaction });

    const candidate = await Candidate.findByPk(candidateId);
    await candidate.decrement("votesNum", { by: 1, transaction });

    const voting = await Voting.findById(votingId);
    await voting.decrement("votesNum", { by: 1, transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
};

module.exports = Vote;
