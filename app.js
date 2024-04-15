const express = require('express');
const app = express();
const port = 3002;

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const mainPageRoutes = require('./routes/main');
const votingRoutes = require('./routes/voting');
const newPollRoutes = require('./routes/newpoll');
const cookiesController = require("./controllers/cookies");

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
  
app.use(cookieParser());
app.use(cookiesController.setUserCookies);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/newpoll', newPollRoutes);
app.use('/voting', votingRoutes);
app.use('/', mainPageRoutes);

app.set('view engine', 'ejs');
app.use(express.static('public'));