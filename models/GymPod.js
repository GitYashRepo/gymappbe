const mongoose = require("mongoose");

const gymPodSchema = new mongoose.Schema({
  name: { type: String, required: true,trim: true},
  locationName: {type: String, required: true},
  pricePer30Min: {type: Number, required: true},
  images: { type: [String], default: [] },
  description: {type: String},
  isActive: {type: Boolean, default: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "Admin"},
  maxCapacity: {type: Number, default: 3 },
}, { timestamps: true });

module.exports = mongoose.model("GymPod", gymPodSchema);
