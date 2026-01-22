const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      // required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 💳 Payment info
    provider: {
      type: String,
      enum: ["PAYPAL", "MANUAL"],
      required: true,
    },

    method: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },

    // 💰 Amount details
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "HKD",
    },

    // 🧾 PayPal-specific fields
    paypal: {
      orderId: { type: String },
      captureId: { type: String },
      payerEmail: { type: String },
    },

    // 📸 Manual payment proof
    proof: {
      image: { type: String }, // Cloudinary URL
      uploadedAt: { type: Date },
    },

    // 📊 Status tracking
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    paidAt: {
      type: Date,
    },

    rawResponse: {
      type: Object, // PayPal full response (for disputes/debug)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
