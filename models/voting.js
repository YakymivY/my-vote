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

Candidate.findbyId = async (candidateId) => {
  return await Candidate.findByPk(candidateId);
};

Voting.incrementVotes = async (votingId, candidateId, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const hasVoted = await Vote.findbyVotingIdandUserId(votingId, userId);

    if (hasVoted) {
      throw new Error("User has already voted");
    }
    const voting = await Voting.findById(votingId);
    if (!voting || voting.status == "closed") {
      throw new Error(`Voting with ID ${votingId} not found or closed`);
    }

    const candidate = await Candidate.findbyId(candidateId);
    if (!candidate) {
      throw new Error(`Candidate with ID ${candidateId} not found`);
    }

    await Vote.create(
      { votingId: votingId, candidateId: candidateId, userId: userId },
      { transaction }
    );
    await voting.increment('votesNum', { by: 1, transaction });
    await candidate.increment('votesNum', { by: 1, transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
};

Voting.deleteVoting = async (votingId, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const voting = await Voting.findById(votingId);
    if (!voting) {
      throw new Error("Voting not found");
    }

    if (voting.userId != userId) {
      throw new Error("Unauthorized to delete this voting");
    }

    await Vote.destroyVotes(votingId, transaction);

    await voting.destroy({ transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
};

Voting.closeVoting = async (votingId, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const voting = await Voting.findById(votingId);

    if (!voting) {
      throw new Error("Voting not found");
    }

    if (voting.userId != userId) {
      throw new Error("Unauthorized to close this voting");
    }

    await voting.update({ status: "closed" }, { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
};

Voting.openVoting = async (votingId, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const voting = await Voting.findById(votingId);

    if (!voting) {
      throw new Error("Voting not found");
    }

    if (voting.userId != userId) {
      throw new Error("Unauthorized to open this voting");
    }

    await voting.update({ status: "active" }, { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    throw error;
  }
};

module.exports = { Voting, Candidate };
