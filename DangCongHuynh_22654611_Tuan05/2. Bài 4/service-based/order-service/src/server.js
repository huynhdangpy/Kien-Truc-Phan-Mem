require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URI || "mongodb://mongo:27017/food_service_based",
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
const Order = mongoose.model("SbOrder", orderSchema);

app.get("/health", (req, res) => res.json({ message: "order-service up" }));

app.post("/", async (req, res) => {
  const { userId, items } = req.body;
  if (!userId || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const userService =
    process.env.USER_SERVICE_URL || "http://user-service:5001";
  const productService =
    process.env.PRODUCT_SERVICE_URL || "http://product-service:5002";

  await axios.get(`${userService}/validate/${userId}`);

  const enrichedItems = [];
  for (const item of items) {
    const { data: product } = await axios.get(
      `${productService}/${item.productId}`,
    );
    enrichedItems.push({
      productId: product._id,
      quantity: item.quantity,
      name: product.name,
      price: product.price,
    });
  }

  const totalPrice = enrichedItems.reduce(
    (s, i) => s + i.quantity * i.price,
    0,
  );
  const order = await Order.create({
    userId,
    items: enrichedItems,
    totalPrice,
  });
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
