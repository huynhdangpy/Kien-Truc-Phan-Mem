import express from "express";
import { requireAdmin } from "../middleware/auth.js";

export function createPostRoutes(cmsCore) {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    try {
      const posts = await cmsCore.listPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const post = await cmsCore.getPostById(req.params.id);
      res.json(post);
    } catch (error) {
      const status = error.response?.status || 500;
      res.status(status).json({ message: error.message });
    }
  });

  router.post("/", requireAdmin, async (req, res) => {
    try {
      const created = await cmsCore.createPost(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.put("/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await cmsCore.updatePost(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      const status = error.response?.status || 500;
      res.status(status).json({ message: error.message });
    }
  });

  router.delete("/:id", requireAdmin, async (req, res) => {
    try {
      const result = await cmsCore.deletePost(req.params.id);
      res.json(result);
    } catch (error) {
      const status = error.response?.status || 500;
      res.status(status).json({ message: error.message });
    }
  });

  return router;
}
