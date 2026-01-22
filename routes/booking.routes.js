const express = require("express");
const router = express.Router();
const {
  createBooking,
  getPodAvailability,
  getMyBookings,
  cancelBooking,
  createMultiSlotBooking,
  uploadPaymentProof,
  getAllBookingsAdmin,
} = require("../controllers/booking.controller");
const auth = require("../middlewares/auth.middleware");
const paymentUpload = require("../middlewares/paymentUpload.middleware");
const { protect } = require("../middlewares/auth.middleware");

// Create booking (pending)
router.post("/", protect, createBooking);

router.post(
  "/multi",
  protect,
  paymentUpload.single("payment"), // 🔴 REQUIRED
  createMultiSlotBooking
);


router.patch(
  "/:bookingId/upload-payment",
  protect,
  paymentUpload.single("payment"),
  uploadPaymentProof
);

// Availability
router.get(
  "/availability/:podId",
  getPodAvailability
);

// User bookings
router.get("/my", protect, getMyBookings);

router.get("/", protect,    getAllBookingsAdmin);

// Cancel
router.patch(
  "/:id/cancel",
  protect,
  cancelBooking
)


module.exports = router;
