const mysql = require("mysql2");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'articles',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool.promise();