require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "mongodb://mongo-cart:27017/cart_db");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    items: [{ productId: String, quantity: Number }],
  },
  { timestamps: true },
);
const Cart = mongoose.model("MicroCart", cartSchema);

app.get("/health", (req, res) => res.json({ message: "cart-service up" }));

app.get("/:userId", async (req, res) => {
  const cart = (await Cart.findOne({ userId: req.params.userId })) || {
    userId: req.params.userId,
    items: [],
  };
  res.json(cart);
});

app.post("/:userId/items", async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) cart = await Cart.create({ userId: req.params.userId, items: [] });

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) existing.quantity += Number(quantity);
  else cart.items.push({ productId, quantity: Number(quantity) });

  await cart.save();
  res.json(cart);
});

app.put("/:userId/items/:productId", async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  const item = cart.items.find((i) => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = Number(quantity);
  if (item.quantity <= 0)
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  await cart.save();
  res.json(cart);
});

app.delete("/:userId/items/:productId", async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  await cart.save();
  res.json(cart);
});

app.delete("/:userId/clear", async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: req.params.userId },
    { items: [] },
    { upsert: true },
  );
  res.json({ message: "Cart cleared" });
});

const port = process.env.PORT || 5004;
app.listen(port, () => console.log(`cart-service ${port}`));
