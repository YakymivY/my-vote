const { Voting } = require("../models/voting");
const User = require("../models/user");

exports.getVotings = (req, res, next) => {
  Voting.findAll({
    include: [{ model: User, as: "creator" }],
    order: [['createdAt', 'DESC']]
  })
    .then((votings) => {
      const userId = req.cookies.token ? req.cookies.token : null;
      res.status(200).json({ votings, userId});
    })
    .catch((err) => {
      console.log(err);
    });
};
