//sql connection goes here

const sql = require('mysql2/promise');
require('dotenv').config();

const db = sql.createPool({
    
})

module.exports = db;