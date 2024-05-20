const { Voting } = require("../models/voting");
const User = require("../models/user");

exports.getVotings = (req, res, next) => {
  Voting.findAll({
    include: [{ model: User, as: "creator" }],
    order: [["createdAt", "DESC"]],
  })
    .then((votings) => {
      const tokenString = req.header["authorization"]
        ? req.header["authorization"]
        : null;
      const token = tokenString && tokenString.split(" ")[1];
      res.status(200).json({ votings, token });
    })
    .catch((err) => {
      console.log(err);
    });
};
