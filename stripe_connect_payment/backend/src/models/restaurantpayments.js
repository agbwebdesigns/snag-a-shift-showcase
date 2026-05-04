const mongoose = require("mongoose");

const restaurantPaymentSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to the user performing the action
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user performing the action
  totalAmount: { type: Number, required: true },
  workerPay: { type: Number, required: true },
  commission: { type: Number, required: true },
  stripeFee: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  stripeEventId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RestaurantPayment = mongoose.model(
  "RestaurantPayment",
  restaurantPaymentSchema,
);

module.exports = RestaurantPayment;
