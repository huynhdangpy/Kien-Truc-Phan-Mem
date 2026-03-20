const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "userpass",
  database: process.env.DB_NAME || "testdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/", (req, res) => {
  res.send("Node.js connected to MySQL!");
});

app.get("/api/status", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT 1 as status");
    connection.release();
    res.json({ message: "Database connected", data: rows });
  } catch (error) {
    res.json({ message: "Error connecting to database", error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Waiting for MySQL connection...");
});
