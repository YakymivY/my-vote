const { Voting } = require("../models/voting");

exports.getVotings = (req, res, next) => {
  Voting.fetchAll()
    .then(([rows, fieldData]) => {
      const userId = req.cookies.userId ? req.cookies.userId : null;
      res.render("main", { votings: rows, req, userId });
    })
    .catch((err) => {
      console.log(err);
    });
};
