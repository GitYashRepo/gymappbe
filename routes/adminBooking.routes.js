const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const adminCtrl = require("../controllers/adminBooking.controller");

router.get("/pending", protect, adminOnly, adminCtrl.getPendingBookings);
router.patch("/:id/approve", protect, adminOnly, adminCtrl.approveBooking);
router.patch("/:id/reject", protect, adminOnly, adminCtrl.rejectBooking);

module.exports = router;
