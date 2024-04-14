const Voting = require("../models/voting");


exports.getVotings = (req, res, next) => {
    res.cookie("authorId", "1");
    res.cookie("authorName", "John Doe");
    Voting.getVotingsFromFile((votings) => {
        
    res.render('main', { votings });
    });
};