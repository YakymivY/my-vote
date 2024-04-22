const express = require('express');
const app = express();
const port = 3002;
const db = require('./util/database')

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const mainPageRoutes = require('./routes/main');
const votingRoutes = require('./routes/voting');
const newPollRoutes = require('./routes/newpoll');
const cookiesController = require("./controllers/cookies");
const authRoutes = require("./routes/auth");

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// db.execute(`
// `).then(result => {console.log(result)}).catch(error => {console.log(error)})
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    next();
  });
  
  

app.use("/auth", authRoutes);
app.use('/newpoll', newPollRoutes);
app.use('/voting', votingRoutes);
app.use('/', mainPageRoutes);

app.set('view engine', 'ejs');
app.use(express.static('public'));