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
  try {
    const order = await razorpayInstance.orders.create({
      amount: 50000,
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
  const webhookSignature = req.headers["x-razorpay-signature"];

  try {
    const isValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }
  
    const paymentDetails = req.body.payload.payment.entity;
    //update payment db
    const payment = await Payments.findOne({
      orderId: paymentDetails.order_id,
    });
    payment.status = paymentDetails.status;
    payment.paymentId = paymentDetails.id;
    payment.method = paymentDetails.method;
    await payment.save();

    //update user db
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.memberShipType = payment.notes.memberShipType;
    await user.save();

    // if (req.body.event === "payment.captured") {
    //   console.log("💰 Payment captured:", payment.id, payment.amount);
    // }

    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});

router.get("/payment/verify", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user.isPremium) {
      return res.status(200).json({ isPremium: user.isPremium });
    } else {
      return res.status(200).json({ isPremium: user.isPremium });
    }
  } catch {
    console.error(error);
    res.status(400).send({ message: error.message });
  }
});
module.exports = router;
