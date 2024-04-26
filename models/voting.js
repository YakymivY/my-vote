const Sequelize = require("sequelize");
const sequelize = require("../util/database");

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

Voting.createWithCandidates = async function (title, description, createdById, candidates) {
    return sequelize.transaction(async (t) => {
      const voting = await this.create({
        title: title,
        description: description,
        userId: createdById,
      }, { transaction: t });
  
      const candidatePromises = candidates.map((name) => {
        return Candidate.create({
          name: name,
          votingId: voting.id,
        }, { transaction: t });
      });
  
      await Promise.all(candidatePromises);
  
      return voting;
    });
  };

module.exports = {Voting, Candidate};