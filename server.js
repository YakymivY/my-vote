const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('main'); // Renders main.ejs
});

app.get('/newpoll', (req, res) => {
    res.render('newpoll'); 
});

app.get('/voting', (req, res) => {
    res.render('voting');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});