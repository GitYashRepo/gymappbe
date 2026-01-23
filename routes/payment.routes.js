const express = require("express");
const {
  createPayPalOrder,
  confirmAndBook,
} = require("../controllers/payment.controller.js");
const { protect } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/create-order",protect, createPayPalOrder);
router.post("/capture-order",protect, confirmAndBook);

module.exports = router;
