// File: src/backend/db.js
const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
    host: 'localhost',      // Your database host (usually localhost)
    user: 'presentryx_user',           // Your database user
    password: '09984210567', // <--- PUT YOUR MYSQL PASSWORD HERE
    database: 'webapp', // <--- PUT YOUR DATABASE NAME HERE
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the 'promise' version so we can use 'await' in server.js
module.exports = pool.promise();