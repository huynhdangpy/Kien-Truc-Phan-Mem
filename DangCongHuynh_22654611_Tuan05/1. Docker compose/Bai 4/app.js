const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Node.js with Express!");
});

app.get("/api", (req, res) => {
  res.json({ message: "This is an API response", timestamp: new Date() });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
