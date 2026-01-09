const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  profileImage: { type: String, default: "" },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  favoritePods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymPod",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
