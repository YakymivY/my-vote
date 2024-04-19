const { Voting} = require("../models/voting");

exports.getVotings = (req, res, next) => {
  Voting.fetchAll()
    .then(([rows, fieldData]) => {res.render("main", { votings: rows, req });})
    .catch((err) => {
      console.log(err);
    });
};
