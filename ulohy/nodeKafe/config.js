require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'coffe.lmsoft.cz',
    password: process.env.DB_PASS || 'coffe',
    database: process.env.DB_NAME || 'coffe_lmsoft_cz',
};

module.exports = dbConfig;
