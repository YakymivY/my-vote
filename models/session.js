const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Session = sequelize.define("Session", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

Session.fetchByUser = async (userId) => {
  const sessions = await Session.findAll({ where: { userId } });
  return sessions;
};

Session.createSession = async (userId, token, expiresAt) => {
  const session = await Session.create({
    userId: userId,
    token: token,
    expiresAt: expiresAt,
  });
  return session;
};

Session.deleteByUser = async (userId) => {
  const result = await Session.destroy({ where: { userId } });
  return result;
};

Session.fetchByToken = async (token) => {
  const session = await Session.findOne({ where: { token } });
  return session;
};

module.exports = Session;
