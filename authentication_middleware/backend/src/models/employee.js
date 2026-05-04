const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
require("env-cmd");

const workHistorySchema = new mongoose.Schema({
  jobtitle: {
    type: String,
    required: true,
    trim: true,
    match: /\b[a-zA-Z]+(-[a-zA-Z]+)?\s?[a-zA-Z]+\b/,
    maxLength: 50,
  },
  employer: {
    type: String,
    required: true,
    trim: true,
    match: /^[a-zA-Z0-9&'’\-., ]{1,60}$/,
    maxLength: 60,
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

const schedulerSchema = new mongoose.Schema({
  jobtitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    trim: true,
  },
  worktime: {
    type: String,
    trim: true,
  },
  clockintime: {
    type: String,
    trim: true,
  },
  clockouttime: {
    type: String,
    trim: true,
  },
  jobid: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const suspendedLogSchema = new mongoose.Schema(
  {
    suspendedby: {
      type: String,
      required: true,
      trim: true,
    },
    suspendedreason: {
      type: String,
      required: true,
      trim: true,
    },
    unsuspendeddate: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const employeeSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      match: /^(?!\s+)[a-zA-Zà-žÀ-Ž' -]{1,50}$/,
      maxLength: 50,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 7,
      validate(value) {
        if (value === "password") {
          throw new Error("Your password cannot be password");
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email address is invalid");
        }
      },
      match:
        /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|info|biz|edu|gov|mil|us)$/,
    },
    rating: [],
    workedjobstotal: {
      type: Number,
      default: 0,
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
    refreshTokens: [
      {
        token: {
          type: String,
        },
      },
    ],
    stripeAccountId: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // Only validate if the value is not null
          return v === null || /^acct_[a-zA-Z0-9]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Stripe account ID!`,
      },
    },
    stripeOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    scheduler: [schedulerSchema],
    workhistory: [workHistorySchema],
    suspended: {
      type: Boolean,
      default: false,
    },
    suspendedlog: [suspendedLogSchema],
    lastlogin: {
      type: Date,
      default: null,
    },
    fcmtoken: {
      type: String,
      trim: true,
    },
    shortnoticecancels: {
      type: Number,
      default: 0,
    },
    maliciousAttempts: {
      type: Number,
      default: 0, // Start with 0 malicious attempts
    },
    validated: {
      type: Boolean,
      default: false,
    },
    termsOfUseAgreement: {
      type: {
        agreed: {
          type: Boolean,
          required: true,
          default: false,
        },
        version: {
          type: String,
          required: true,
          default: "v1.0",
        },
        agreedAt: {
          type: Date,
          default: null,
        },
      },
      default: () => ({
        agreed: false,
        version: "v1.0",
        agreedAt: null,
      }),
    },
    snagAShiftOnboarding: {
      type: {
        avatarUploaded: {
          type: Boolean,
          required: true,
          default: false,
        },
        dlUploaded: {
          type: Boolean,
          required: true,
          default: false,
        },
        foodHandlersCertUploaded: {
          type: Boolean,
          required: true,
          default: false,
        },
        tosAgreementSigned: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
      default: () => ({
        avatarUploaded: false,
        dlUploaded: false,
        foodHandlersCertUploaded: false,
        tosAgreementSigned: false,
      }),
    },
    avatar: {
      type: Buffer, //stores buffer with binary image data in the database alongside the user that the image belongs to
    },
    driverslicense: {
      type: Buffer, //stores buffer with binary image data in the database alongside the user that the image belongs to
    },
    foodhandlerscert: {
      type: Buffer, //stores buffer with binary image data in the database alongside the user that the image belongs to
    },
    workerscompproof: {
      type: Buffer, //stores buffer with binary image data in the database alongside the user that the image belongs to
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.virtual("applications", {
  ref: "Applications",
  localField: "_id",
  foreignField: "owner",
}); //creates virtual data to create a relationship between user and task

employeeSchema.virtual("messages", {
  ref: "Messages",
  localField: "_id",
  foreignField: "owner",
});

employeeSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  delete userObject.driverslicense;
  delete userObject.foodhandlerscert;
  delete userObject.workerscompproof;
  return userObject;
};

employeeSchema.methods.generateAuthToken = async function () {
  //cannot use (this) with shorthand functions, these are methods on the individual user
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  try {
    const token = jwt.sign({ _id: this._id.toString() }, secret, {
      expiresIn: "24h",
    });

    //this creates a token by sending a payload that id's the user and a string to help create the random token
    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
  } catch (error) {
    throw new Error("Error creating tokens");
  }
};

employeeSchema.statics.findByCredentials = async (email, password) => {
  //this creates a static to find the user by the email address and make sure the password is correct, findByCredentials becomes a reusable userSchema static, this is for methods on the User.model
  const employee = await Employees.findOne({ email }); //this looks for the account with the given email address provided

  if (employee === null) {
    throw new Error("Unable to log in!");
  }

  const isMatch = await bcrypt.compare(password, employee.password); //this compares the password given with the encrypted hash of the password connected to the username given
  if (!isMatch) {
    // Check if the account is suspended
    if (employee.suspended === true) {
      throw new Error("Account suspended. Please contact support.");
    }
    throw new Error("Unable to log in!");
  }
  // Update lastLogin date
  employee.lastlogin = new Date();
  await employee.save();

  return employee;
};

//hash the plain text password before saving!
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    //if password is what is being modified
    this.password = await bcrypt.hash(this.password, 8); //run bcrypt to hash the password
  }
  next(); //next is the parameter that is passed in, it is a funtion that has to be run for the program to continue or it will just hang here
});

const Employees = mongoose.model("Employees", employeeSchema);
module.exports = Employees;
