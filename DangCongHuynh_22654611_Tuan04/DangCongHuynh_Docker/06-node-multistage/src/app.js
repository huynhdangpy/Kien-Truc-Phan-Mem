const http = require("http");

const PORT = 3000;

http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from multi-stage Node build!\n");
  })
  .listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
