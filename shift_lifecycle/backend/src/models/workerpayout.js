const mongoose = require("mongoose");

const workerPayoutSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to the user performing the action
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user performing the action
  amountPaid: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  stripeTransferId: {
    type: String,
  },
  payoutDate: {
    type: Date,
    default: Date.now,
  },
  notes: { type: String },
});

const WorkerPayout = mongoose.model("WorkerPayout", workerPayoutSchema);

module.exports = WorkerPayout;
