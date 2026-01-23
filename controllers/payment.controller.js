const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const paypalClient = require("../config/paypal.js");
const Payment = require("../models/Payment.js");

exports.createPayPalOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "HKD",
            value: Number(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: "sardinaz://paypal-success",
        cancel_url: "sardinaz://paypal-cancel",
        user_action: "PAY_NOW",
      },
    });

    const order = await paypalClient.execute(request);

    // ✅ Create payment WITHOUT booking
    await Payment.create({
      user: userId,
      provider: "PAYPAL",
      method: "ONLINE",
      amount,
      currency: "HKD",
      status: "PENDING",
      paypal: {
        orderId: order.result.id,
      },
    });

    res.status(201).json({
     orderId: order.result.id,
     approveUrl: order.result.links.find(l => l.rel === "approve").href,
   });

  } catch (error) {
    console.error("Create PayPal Order Error:", error);
    res.status(500).json({ message: "Unable to create PayPal order" });
  }
};


exports.confirmAndBook = async (req, res) => {
  const { orderID, podId, slots, date, persons } = req.body;
  const userId = req.user.id;

  try {
    const payment = await Payment.findOne({
      "paypal.orderId": orderID,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // 1️⃣ CAPTURE PAYMENT
    const request =
      new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const captureRes = await paypalClient.execute(request);

    if (captureRes.result.status !== "COMPLETED") {
      throw new Error("Payment not completed");
    }

    const capture =
      captureRes.result.purchase_units[0].payments.captures[0];

    payment.status = "COMPLETED";
    payment.paypal.captureId = capture.id;
    payment.paypal.payerEmail =
      captureRes.result.payer.email_address;
    payment.paidAt = new Date();
    payment.rawResponse = captureRes.result;
    await payment.save();

    // 2️⃣ CREATE BOOKING (THIS WAS MISSING 🔴)
    const pod = await GymPod.findById(podId);
    if (!pod) throw new Error("Gym pod not found");

    const booking = await Booking.create({
      user: userId,
      gymPod: podId,
      date,
      slots,
      persons,
      payment: payment._id,
      status: "CONFIRMED",
    });

    payment.booking = booking._id;
    await payment.save();

    // 3️⃣ FINAL RESPONSE (CRITICAL)
    res.status(200).json({
      success: true,
      booking,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("Confirm & Book Error:", err);
    res.status(500).json({ message: err.message });
  }
};
