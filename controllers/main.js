const { Voting, getVotingsFromFile } = require("../models/voting");

exports.getVotings = (req, res, next) => {
  getVotingsFromFile((err, votings) => { // using callback getVotingsFromFile()
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while fetching votings');
    } else {
      res.render("main", { votings, req });
    }
  });
};
