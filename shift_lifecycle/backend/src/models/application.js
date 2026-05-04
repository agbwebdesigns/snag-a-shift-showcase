const mongoose = require("mongoose");
const validator = require("validator");

const billSchema = new mongoose.Schema({
  workerPayout: {
    type: Number,
    required: true,
    trim: true,
  },
  commissionFee: {
    type: Number,
    required: true,
    trim: true,
  },
  processingFee: {
    type: Number,
    required: true,
    trim: true,
  },
  totalCharge: {
    type: Number,
    required: true,
    trim: true,
  },
});

const workHistorySchema = new mongoose.Schema({
  jobtitle: {
    type: String,
    required: true,
    trim: true,
  },
  employer: {
    type: String,
    required: true,
    trim: true,
  },
  startdate: {
    type: String,
    required: true,
  },
  enddate: {
    type: String,
  },
  currentemployer: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const PunchEditSchema = new mongoose.Schema({
  editedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  editor: {
    type: String,
    required: true,
  },
  infrom: {
    type: String,
  },
  outfrom: {
    type: String,
  },
  into: {
    type: String,
  },
  outto: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
});

const applicationsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    rated: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
    },
    workedjobstotal: {
      type: Number,
    },
    workhistory: [workHistorySchema],
    jobid: {
      type: String,
    },
    jobtitle: {
      type: String,
    },
    description: {
      type: String,
    },
    worktime: {
      type: String,
    },
    endtime: {
      type: String,
    },
    dollarsperhr: {
      type: Number,
    },
    clockintime: {
      type: String,
      trim: true,
    },
    clockouttime: {
      type: String,
      trim: true,
    },
    lockTime: {
      type: Date, // Automatically 24 hours after clock-out
    },
    status: {
      type: String,
      default: "openJob",
      enum: [
        "openJob", //job has not been filled or completed
        "filled", //a worker has been selected
        "started", //the worker has clocked in and started work
        "pendingComplete", //work has been completed and worker has clocked out, punches can be edited and worker can be rated
        "pendingPayment", //job lockout time has expired or job has been completed by the restaurant, payment process to charge the restaurant and pay the worker has started
        "paymentFailed", //payment processing has failed, attempting again...
        "paid", //the restaurant has been charged and the worker has been paid
      ],
    },
    // Stripe PaymentIntent ID
    paymentIntentId: {
      type: String,
      trim: true,
      match: /^pi_\w{16,32}$/,
    },
    // Stripe Transfer ID
    transferId: {
      type: String,
      trim: true,
      match: /^tr_\w{16,32}$/,
    },
    // Stripe Payout ID
    payoutId: {
      type: String,
      trim: true,
      match: /^po_\w{16,32}$/,
    },
    bill: [billSchema],
    punchedits: [PunchEditSchema],
    avatar: {
      type: Buffer, //stores buffer with binary image data in the database alongside the user that the image belongs to
    },
    foodhandlerscert: {
      type: Buffer, //stores buffer with binary image data in the database alongside the user that the image belongs to
    },
    active: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employees", //sets the relationship between the job and the application
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Jobs", //sets the relationship between the job and the application
    },
  },
  {
    timestamps: true,
  },
);

const Applications = mongoose.model("Applications", applicationsSchema);
module.exports = Applications;
