require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello Sardinaz App 🚀 Backend is running successfully!",
  });
});
app.use("/v1/api/users", require("./routes/userAuth.routes"));
app.use("/v1/api/admin", require("./routes/adminAuth.routes"));
app.use("/v1/api/bookings", require("./routes/booking.routes"));
app.use("/v1/api/admin/bookings", require("./routes/adminBooking.routes"));
app.use("/v1/api/pods", require("./routes/gymPod.routes"));

module.exports = app;
