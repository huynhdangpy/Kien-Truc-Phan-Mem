import express from "express";

export const mediaPlugin = {
  name: "Media Plugin",
  register(app) {
    const router = express.Router();

    const mediaItems = [
      {
        id: 1,
        type: "image",
        name: "hero-banner.jpg",
        url: "https://picsum.photos/seed/cms/1200/500",
      },
      {
        id: 2,
        type: "image",
        name: "thumbnail.jpg",
        url: "https://picsum.photos/seed/thumb/400/300",
      },
    ];

    router.get("/", (_req, res) => {
      res.json(mediaItems);
    });

    app.use("/plugins/media", router);
  },
};
