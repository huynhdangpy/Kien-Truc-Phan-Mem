require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) =>
  res.json({ message: "Micro API gateway running" }),
);

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://auth-service:5001",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
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
app.use(
  "/api/cart",
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL || "http://cart-service:5004",
    changeOrigin: true,
    pathRewrite: { "^/api/cart": "" },
  }),
);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`micro gateway ${port}`));
