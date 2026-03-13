const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "src", "app.js");
const distDir = path.join(__dirname, "dist");
const distPath = path.join(distDir, "app.js");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync(srcPath, distPath);
console.log("Build completed: dist/app.js");
