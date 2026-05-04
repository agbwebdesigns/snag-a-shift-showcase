const mongoose = require("mongoose");

const commissionFeeSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to the user performing the action
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user performing the action
  commission: { type: Number, required: true },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: { type: String },
});

const CommissionFee = mongoose.model("CommissionFee", commissionFeeSchema);

module.exports = CommissionFee;
