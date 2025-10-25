const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    amount: {
      type: String,
      require: true,
    },
    method: {
      type: String,
    },
    currency: {
      type: String,
      require: true,
    },
    reciept: {
      type: String,
    },
    notes: {
      firstName: {
        type: String,
        require: true,
      },
      lastName: {
        type: String,
        require: true,
      },
      memberShipType: {
        type: String,
        require,
      },
    },
  },
  { timestamps: true }
);

const Payments = mongoose.model("Payments", paymentSchema);
module.exports = Payments;
