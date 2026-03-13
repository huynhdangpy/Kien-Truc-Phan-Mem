import express from "express";
import axios from "axios";

export const commentPlugin = {
  name: "Comment Plugin",
  register(app, context) {
    const router = express.Router();
    const client = axios.create({
      baseURL: context.jsonServerUrl,
      timeout: 5000,
    });

    router.get("/:postId", async (req, res) => {
      try {
        const response = await client.get(
          `/comments?postId=${req.params.postId}`,
        );
        res.json(response.data);
      } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json({ message: error.message });
      }
    });

    app.use("/plugins/comments", router);
  },
};
