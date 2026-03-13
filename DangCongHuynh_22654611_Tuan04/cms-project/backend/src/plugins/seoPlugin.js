import express from "express";

function generateSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const seoPlugin = {
  name: "SEO Plugin",
  register(app, context) {
    const router = express.Router();

    router.get("/:postId", async (req, res) => {
      try {
        const post = await context.cmsCore.getPostById(req.params.postId);

        res.json({
          titleTag: post.title,
          metaDescription: (post.content || "").slice(0, 160),
          slug: generateSlug(post.title),
          keywords: (post.tags || []).join(", "),
        });
      } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json({ message: error.message });
      }
    });

    app.use("/plugins/seo", router);
  },
};
