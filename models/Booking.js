const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gymPod: { type: mongoose.Schema.Types.ObjectId, ref: "GymPod", required: true },

  slotDate: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  slotsCount: { type: Number, required: true },
  personsCount: { type: Number, required: true },

  pricePerSlot: Number,
  totalAmount: Number,

  bookingType: {
    type: String,
    enum: ["same_day", "future_day"],
    required: true,
  },

  paymentProof: {
  image: { type: String },     // Cloudinary URL
  uploadedAt: { type: Date },
},


  status: {
    type: String,
    enum: [
      "confirmed",
      "pending_payment",
      "payment_uploaded",
      "approved",
      "rejected",
      "cancelled",
    ],
    default: "pending_payment",
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
