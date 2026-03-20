require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URI || "mongodb://mongo-order:27017/order_db",
);

const orderSchema = new mongoose.Schema(
  {
    userId: String,
    items: [
      { productId: String, quantity: Number, name: String, price: Number },
    ],
    totalPrice: Number,
    status: { type: String, default: "pending" },
  },
  { timestamps: true },
);
const Order = mongoose.model("MicroOrder", orderSchema);

app.get("/health", (req, res) => res.json({ message: "order-service up" }));

app.post("/", async (req, res) => {
  const { userId, items } = req.body;
  if (!userId || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const authUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:5001";
  const productUrl =
    process.env.PRODUCT_SERVICE_URL || "http://product-service:5002";
  await axios.get(`${authUrl}/validate/${userId}`);

  const enriched = [];
  for (const item of items) {
    const { data: product } = await axios.get(
      `${productUrl}/${item.productId}`,
    );
    enriched.push({
      productId: product._id,
      quantity: item.quantity,
      name: product.name,
      price: product.price,
    });
  }

  const totalPrice = enriched.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await Order.create({ userId, items: enriched, totalPrice });
  res.status(201).json(order);
});

app.get("/history/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

const port = process.env.PORT || 5003;
app.listen(port, () => console.log(`order-service ${port}`));
