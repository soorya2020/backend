const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/auth");
const razorpayInstance = require("../../utils/razorpay");
const Payments = require("../../model/payment");
const User = require("../../model/user");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

router.post("/payment/order", userAuth, async (req, res) => {
  console.log("order triggered");

  try {
    const order = await razorpayInstance.orders.create({
      amount: 50000, //500 rupees
      currency: "INR",
      receipt: `receipt#${req.user._id}`,
      notes: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        memberShipType: req.body.memberShipType,
      },
    });

    const { id, status, amount, currency, reciept, notes } = order;
    const { firstName, lastName, email } = req.user;

    const payment = new Payments({
      userId: req.user.id,
      orderId: id,
      status,
      amount,
      currency,
      reciept,
      notes,
    });
    await payment.save();

    res.status(200).json({
      order: { ...order, key: process.env.RAZORPAY_KEY_ID },
      user: { firstName, lastName, email },
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});

router.post("/payment/webhook", async (req, res) => {
  console.log("webhook triggered");
  const webhookSignature = req.headers["x-razorpay-signature"];

  try {
    // 1. Validate using the RAW BODY we captured in app.js
    // DO NOT use JSON.stringify(req.body) anymore
    const isValid = validateWebhookSignature(
      req.rawBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    console.log(isValid, "isvalid");

    if (!isValid) {
      console.log("❌ Signature mismatch! Secret or RawBody is incorrect.");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 2. Only run your logic if the payment was actually captured
    // Razorpay sends many events (created, authorized, etc.), we only care about 'captured'
    if (req.body.event === "payment.captured") {
      const paymentDetails = req.body.payload.payment.entity;

      // Update payment db
      const payment = await Payments.findOne({
        orderId: paymentDetails.order_id,
      });

      if (payment) {
        payment.status = paymentDetails.status;
        payment.paymentId = paymentDetails.id;
        payment.method = paymentDetails.method;
        await payment.save();

        // Update user db
        const user = await User.findOne({ _id: payment.userId });
        if (user) {
          user.isPremium = true;
          // Use the memberShipType stored in the payment notes
          user.memberShipType = payment.notes?.memberShipType || "premium";
          await user.save();
          console.log(`✅ User ${user.firstName} upgraded to premium!`);
        }
      }
    }

    // 3. Always return 200 to Razorpay so they don't keep retrying
    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send({ message: error.message });
  }
});

router.get("/payment/verify", userAuth, async (req, res) => {

  try {
    // Re-fetch user from DB to get the LATEST status from the webhook
    const currentUser = await User.findById(req.user._id);
    return res.status(200).json({ isPremium: currentUser.isPremium });
  } catch {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});
module.exports = router;
