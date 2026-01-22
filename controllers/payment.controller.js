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

    res.status(201).json(order.result);
  } catch (error) {
    console.error("Create PayPal Order Error:", error);
    res.status(500).json({ message: "Unable to create PayPal order" });
  }
};



exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ message: "Order ID required" });
    }

    const payment = await Payment.findOne({
      "paypal.orderId": orderID,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "COMPLETED") {
      return res.status(409).json({ message: "Payment already captured" });
    }

    const request =
      new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    const captureData =
      capture.result.purchase_units[0].payments.captures[0];

    payment.status = "COMPLETED";
    payment.paypal.captureId = captureData.id;
    payment.paypal.payerEmail =
      capture.result.payer.email_address;
    payment.paidAt = new Date();
    payment.rawResponse = capture.result;

    await payment.save();

    // ❌ DO NOT TOUCH BOOKING HERE

    res.status(200).json({
      success: true,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Capture PayPal Order Error:", error);
    res.status(500).json({ message: "Unable to capture payment" });
  }
};
