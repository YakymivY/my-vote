const Voting = require("../models/voting");

exports.getVotings = (req, res, next) => {
  Voting.getVotingsFromFile((votings) => {
    res.render("main", { votings, req });
  });
};
