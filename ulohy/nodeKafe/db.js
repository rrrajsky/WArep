const mysql = require('mysql');
const dbConfig = require('./config');

const conn = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

conn.connect(err => {
    if (err) {
        console.error('Connection failed: ' + err.stack);
        return;
    }
    console.log('Connected successfully');
});

module.exports = conn;
