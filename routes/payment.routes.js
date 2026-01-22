const express = require("express");
const {
  createPayPalOrder,
  capturePayPalOrder,
} = require("../controllers/payment.controller.js");
const { protect } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/create-order",protect, createPayPalOrder);
router.post("/capture-order",protect, capturePayPalOrder);

module.exports = router;
