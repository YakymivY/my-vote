const { Voting } = require("../models/voting");
const User = require("../models/user");

exports.getVotings = (req, res, next) => {
  Voting.findAll({
    include: [{ model: User, as: "creator" }],
    order: [['createdAt', 'DESC']]
  })
    .then((votings) => {
      const userId = req.cookies.token ? req.cookies.token : null;
      res.json({ votings, userId, req });
    })
    .catch((err) => {
      console.log(err);
    });
};
