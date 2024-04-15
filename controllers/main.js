const Voting = require("../models/voting");

exports.getVotings = (req, res, next) => {
  res.cookie("userId", "1");
  res.cookie("userName", "John Doe");
  Voting.getVotingsFromFile((votings) => {
    res.render("main", { votings, req });
  });
};
