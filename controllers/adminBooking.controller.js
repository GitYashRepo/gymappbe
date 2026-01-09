const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

/**
 * GET all bookings waiting for admin approval
 * GET /v1/api/admin/bookings/pending
 */
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "payment_uploaded",
    })
      .populate("user", "email phone")
      .populate("gymPod", "name locationName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * APPROVE booking
 * PATCH /v1/api/admin/bookings/:id/approve
 */
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "approved";
    await booking.save();

    await Notification.create({
      user: booking.user,
      title: "Booking Approved",
      message: "Your booking has been approved 🎉",
    });

    res.json({ success: true, message: "Booking approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * REJECT booking
 * PATCH /v1/api/admin/bookings/:id/reject
 */
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "rejected";
    await booking.save();

    await Notification.create({
      user: booking.user,
      title: "Booking Rejected",
      message: "Payment verification failed",
    });

    res.json({ success: true, message: "Booking rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
