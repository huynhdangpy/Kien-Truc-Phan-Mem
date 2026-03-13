const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "dist");
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Docker App</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(React.createElement("h1", null, "Hello from React in Docker"));
    </script>
  </body>
</html>`;

fs.writeFileSync(path.join(dist, "index.html"), html);
console.log("Build complete: dist/index.html");
