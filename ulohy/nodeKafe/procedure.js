const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const dbConfig = require('./config'); 
const dbdriver = require('./db'); 
const requests = require('./requests'); 

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true); 
    },
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400
}));


app.use(basicAuth({
    users: { 'coffe': 'kafe' },
    challenge: true,
    unauthorizedResponse: (req) => {
        return JSON.stringify({ "msg": 'Text to send if user hits Cancel button' });
    }
}));


app.get('/', (req, res) => {
    res.send('Welcome to the Coffee API');
});

app.post('/requests', async (req, res) => {
    const r = new requests(dbdriver);
    res.json({ msg: 'Request processed' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
