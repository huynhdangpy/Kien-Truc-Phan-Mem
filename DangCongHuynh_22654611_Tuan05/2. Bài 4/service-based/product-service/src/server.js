require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URI || "mongodb://mongo:27017/food_service_based",
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String,
    category: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const Product = mongoose.model("SbProduct", productSchema);

app.get("/health", (req, res) => res.json({ message: "product-service up" }));
app.get("/", async (req, res) =>
  res.json(await Product.find().sort({ createdAt: -1 })),
);
app.get("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});
app.post("/", async (req, res) =>
  res.status(201).json(await Product.create(req.body)),
);
app.put("/:id", async (req, res) =>
  res.json(
    await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }),
  ),
);
app.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`product-service ${port}`));
