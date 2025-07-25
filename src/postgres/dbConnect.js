// dbConnect.js
const { Pool } = require("pg");

// Database connection configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

module.exports = pool;
