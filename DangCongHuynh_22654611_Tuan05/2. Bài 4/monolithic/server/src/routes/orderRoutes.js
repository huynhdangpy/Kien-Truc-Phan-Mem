const express = require("express");
const {
  placeOrder,
  getOrderHistory,
} = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/history", protect, getOrderHistory);

module.exports = router;
