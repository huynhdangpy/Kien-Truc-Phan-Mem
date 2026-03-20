require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) =>
  res.json({ message: "Service-based gateway up" }),
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || "http://user-service:5001",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  }),
);
app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || "http://product-service:5002",
    changeOrigin: true,
    pathRewrite: { "^/api/products": "" },
  }),
);
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || "http://order-service:5003",
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "" },
  }),
);

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Gateway on ${port}`));
