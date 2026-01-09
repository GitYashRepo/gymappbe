const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const GymPod = require("../models/GymPod");
const Notification = require("../models/Notification");

exports.createMultiSlotBooking = async (req, res) => {
  try {
    const {
  gymPodId,
  slotDate,
  startTime,
  endTime,
  slotsCount,
  personsCount,
  bookingType,
} = req.body

    const pod = await GymPod.findById(gymPodId);

    const pricePerSlot = pod.pricePer30Min;
    const totalAmount = pricePerSlot * slotsCount * personsCount;

    const booking = await Booking.create({
  user: req.user.id,
  gymPod: gymPodId,
  slotDate,
  startTime: new Date(startTime),
  endTime: new Date(endTime),
  slotsCount: Number(slotsCount),
  personsCount: Number(personsCount),
  bookingType,
  status: bookingType === "same_day" ? "confirmed" : "pending_payment",
})


    // 🔔 NOTIFICATION — BOOKING CREATED
    await Notification.create({
      user: req.user.id,
      title: "Booking Created",
      message: `Booking created for ${slotDate}`,
    });

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * 1️⃣ CREATE BOOKING (30 min)
 * POST /api/bookings
 */
exports.createBooking = async (req, res) => {
  try {
    const { gymPodId, slotDate, startTime, personsCount } = req.body;

    if (!gymPodId || !slotDate || !startTime || !personsCount) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    const pod = await GymPod.findById(gymPodId);
    if (!pod) {
      return res.status(404).json({ message: "Pod not found" });
    }

    if (personsCount > pod.maxCapacity) {
      return res.status(400).json({
        message: `Maximum ${pod.maxCapacity} persons allowed`
      });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    // 🔢 Count already booked persons
    const result = await Booking.aggregate([
      {
        $match: {
          gymPod: new mongoose.Types.ObjectId(gymPodId),
          slotDate,
          startTime: start,
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$personsCount" }
        }
      }
    ]);

    const alreadyBooked = result[0]?.total || 0;

    if (alreadyBooked + personsCount > pod.maxCapacity) {
      return res.status(400).json({
        message: "Slot capacity full, please select another slot"
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      gymPod: gymPodId,
      slotDate,
      startTime: start,
      endTime: end,
      personsCount
    });

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 2️⃣ GET POD AVAILABILITY (SLOTS)
 * GET /api/bookings/availability/:podId?date=YYYY-MM-DD
 */
exports.getPodAvailability = async (req, res) => {
  try {
    const { podId } = req.params;
    const { date } = req.query;

    const bookings = await Booking.find({
      gymPod: podId,
      slotDate: date,
      status: { $ne: "cancelled" },
    });

    const slotMap = {};

    bookings.forEach(b => {
      let cursor = new Date(b.startTime);
      while (cursor < b.endTime) {
        const key = cursor.getTime();
        slotMap[key] = (slotMap[key] || 0) + b.personsCount;
        cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
      }
    });

    res.json({
      success: true,
      data: Object.entries(slotMap).map(([t, p]) => ({
        startTime: new Date(Number(t)),
        bookedPersons: p,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * 3️⃣ GET USER BOOKINGS
 * GET /api/bookings/my
 */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("gymPod", "name locationName images")
      .sort({ startTime: -1 });

    // Auto mark completed
    const now = new Date();
    bookings.forEach(b => {
      if (b.status === "booked" && b.endTime < now) {
        b.status = "completed";
        b.save();
      }
    });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 4️⃣ CANCEL BOOKING
 * PATCH /api/bookings/:id/cancel
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.startTime <= new Date()) {
      return res.status(400).json({
        message: "Cannot cancel ongoing or past booking"
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPLOAD PAYMENT SCREENSHOT
 * PATCH /api/bookings/:id/upload-payment
 */
exports.uploadPaymentProof = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Payment image required" });
    }

    booking.paymentProof = {
      image: req.file.path, // Cloudinary URL
      uploadedAt: new Date(),
    };

    booking.status = "payment_uploaded";
    await booking.save();

    return res.json({
      success: true,
      booking,
    });

  } catch (err) {
    console.error("UPLOAD PAYMENT ERROR:", err);
    return res.status(500).json({ message: "Payment upload failed" });
  }
};
