import "dotenv/config";
import express from "express";
import cors from "cors";

import { CMSCore } from "./core/cmsCore.js";
import { PluginManager } from "./core/pluginManager.js";
import { createPostRoutes } from "./routes/posts.js";
import { attachRole } from "./middleware/auth.js";
import { commentPlugin } from "./plugins/commentPlugin.js";
import { seoPlugin } from "./plugins/seoPlugin.js";
import { mediaPlugin } from "./plugins/mediaPlugin.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JSON_SERVER_URL = process.env.JSON_SERVER_URL || "http://localhost:3001";

app.use(cors());
app.use(express.json());
app.use(attachRole);

const cmsCore = new CMSCore(JSON_SERVER_URL);
const pluginManager = new PluginManager();

pluginManager.register(commentPlugin);
pluginManager.register(seoPlugin);
pluginManager.register(mediaPlugin);

pluginManager.initialize(app, {
  cmsCore,
  jsonServerUrl: JSON_SERVER_URL,
});

app.get("/", (_req, res) => {
  res.json({
    app: "CMS Backend API",
    architecture: "Layered + Microkernel",
    plugins: pluginManager.list(),
  });
});

app.get("/plugins", (_req, res) => {
  res.json({ plugins: pluginManager.list() });
});

app.use("/posts", createPostRoutes(cmsCore));

app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
  console.log(`JSON Server target: ${JSON_SERVER_URL}`);
});
