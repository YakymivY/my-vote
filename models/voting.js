const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Vote = require("../models/vote");

const Voting = sequelize.define("Voting", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM("active", "closed", "completed"),
    defaultValue: "active",
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  votesNum: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

const Candidate = sequelize.define("Candidate", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  votesNum: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  votingId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Voting,
      key: "id",
    },
  },
});

Voting.createWithCandidates = async function (
  title,
  description,
  createdById,
  candidates
) {
  return sequelize.transaction(async (t) => {
    const voting = await this.create(
      {
        title: title,
        description: description,
        userId: createdById,
      },
      { transaction: t }
    );

    const candidatePromises = candidates.map((name) => {
      return Candidate.create(
        {
          name: name,
          votingId: voting.id,
        },
        { transaction: t }
      );
    });

    await Promise.all(candidatePromises);

    return voting;
  });
};

Voting.findById = async (votingId) => {
  return await Voting.findByPk(votingId);
};

Candidate.findbyIdandVotingId = async (candidateId, votingId) => {
  return await Candidate.findOne({
    where: { id: candidateId, votingId: votingId },
  });
};

Voting.prototype.incrementVotesNum = function (transaction) {
  // prototype lets call on instances not only on classes
  const voting = this;

  return sequelize.transaction(
    async (t) => {
      voting.votesNum++;
      await voting.save({ transaction: t });
    },
    { transaction }
  );
};

Candidate.prototype.incrementVotesNum = function (transaction) {
  const candidate = this;

  return sequelize.transaction(
    async (t) => {
      candidate.votesNum++;
      await candidate.save({ transaction: t });
    },
    { transaction }
  );
};

Voting.incrementVotes = async (votingId, candidateId, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const hasVoted = await Vote.hasUserVoted(votingId, userId);

    if (hasVoted) {
      throw new Error("User has already voted");
    }
    const voting = await Voting.findById(votingId);
    console.log(voting);
    if (!voting || voting.status == "closed") {
      throw new Error(`Voting with ID ${votingId} not found or closed`);
    }

    const candidate = await Candidate.findbyIdandVotingId(
      candidateId,
      votingId
    );
    if (!candidate) {
      throw new Error(`Candidate with ID ${candidateId} not found`);
    }

    await Vote.create(
      { votingId: votingId, candidateId: candidateId, userId: userId },
      { transaction }
    );

    await candidate.increment("votesNum", { transaction });
    await voting.increment("votesNum", { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
};

module.exports = { Voting, Candidate };
