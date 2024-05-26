const { Voting } = require("../models/voting");
const User = require("../models/user");
const { Op } = require("sequelize");

exports.getVotings = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const status = req.query.status || ["active", "closed"];
  const votingLength = await Voting.count({
    where: {
      status: {
        [Op.in]: [status],
      },
    },
  });
  const inplimit = parseInt(req.query.limit) || votingLength;
  const startIndex = (page - 1) * inplimit;
  const endIndex = page * inplimit;
  const results = {};
  try {
    results.results = await Voting.findAll({
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      limit: inplimit,
      offset: startIndex,
      where: {
        status: {
          [Op.in]: [status],
        },
      },
    });
    results.next = {
      page: page + 1,
      left: Math.max(
        Math.max(0, votingLength - endIndex),
        Math.min(inplimit, votingLength - endIndex)
      ),
    };
    results.previous = {
      page: page - 1,
    };

    const tokenString = req.header["authorization"]
      ? req.header["authorization"]
      : null;

    const token = tokenString && tokenString.split(" ")[1];
    res.status(200).json({ results, token });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
