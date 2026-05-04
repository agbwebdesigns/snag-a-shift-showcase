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

const scheduledSchema = new mongoose.Schema(
  {
    employeename: {
      type: String,
      trim: true,
    },
    employeeid: {
      type: String,
      trim: true,
    },
    appid: {
      type: String,
      trim: true,
    },
    foodhandlerscert: {
      type: Buffer,
    },
    avatar: {
      type: Buffer,
    },
    rating: {
      type: String,
      trim: true,
    },
    kudos: {
      type: Array,
    },
  },
  {
    timestamps: true,
  },
);

const jobsSchema = new mongoose.Schema(
  {
    companyname: {
      type: String,
      required: true,
      trim: true,
    },
    jobtitle: {
      type: String,
      required: true,
      trim: true,
      match: /^([a-zA-z]\s*){1,30}$/,
      maxLength: 30,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      match: /^(?!\s*$)[A-Za-z0-9.,!?'"()\- ]{1,256}$/,
      maxLength: 256,
    },
    dollarsperhr: {
      type: Number,
      required: true,
      trim: true,
      match: /^\d{1,3}$/,
      maxLength: 3,
    },
    worktime: {
      type: String,
      required: true,
      trim: true,
    },
    endtime: {
      type: String,
      required: true,
      trim: true,
    },
    hiringmanager: {
      type: String,
      required: true,
      trim: true,
    },
    storemanager: {
      type: String,
      required: true,
      trim: true,
    },
    storenumber: {
      type: Number,
      trim: true,
    },
    streetaddress: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipcode: {
      type: Number,
      required: true,
      trim: true,
      maxLength: 5,
    },
    clockincode: {
      type: String,
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
      type: Date,
    }, // Automatically 24 hours after clock-out
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
    openjob: {
      type: Boolean,
      default: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    rated: {
      type: Boolean,
      default: false,
    },
    punchedits: [PunchEditSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employers", //sets the relationship between the user and the task
    },
    scheduledEmployee: scheduledSchema,
    earnings: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

jobsSchema.virtual("applications", {
  ref: "Applications",
  localField: "_id",
  foreignField: "job",
}); //creates virtual data to create a relationship between user and task

const Jobs = mongoose.model("Jobs", jobsSchema);
module.exports = Jobs;
