const Jobs = require("../../models/job");
const randomize = require("randomatic");
const { onShiftCreationRestNotify } = require("../../controllers/messages");
const Messages = require("../../models/messages");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { logActivity } = require("../../controllers/logactivity");
const getNormalizedIp = require("../../controllers/getnormalizedip");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const createJob = async (req, res) => {
  //console.log("starting");

  // 1. Sanitize incoming data using DOMPurify
  const sanitizedData = Object.keys(req.body).reduce((acc, key) => {
    const value = req.body[key];
    acc[key] = typeof value === "string" ? DOMPurify.sanitize(value) : value;
    // acc[key] = DOMPurify.sanitize(req.body.history[key]);
    return acc;
  }, {});

  // 2. Check for any empty sanitized fields
  const emptyFields = Object.entries(sanitizedData).filter(
    ([, value]) => value === "",
  );

  if (emptyFields.length > 0) {
    // 3. Create activity log for missing or empty fields
    const message = `The following fields are empty after sanitization: ${emptyFields
      .map(([key]) => key)
      .join(", ")}`;

    // logging the activity (customize as needed)
    //console.log(`[Warning] ${message} - IP: ${req.ip}`);

    await logActivity(
      req.employer._id,
      "Malicious Activity Detected",
      "Upload of malicous code attempted to the employeerating.js endpoint, Server detected and thwarted.",
      "employer",
      getNormalizedIp(req),
    );

    // Send error response back to the client
    return res.status(400).json({ error: message });
  }

  //check to make sure the entered start time is before the entered end time
  const worktimeCheck = new Date(req.body.worktime);
  const endtimeCheck = new Date(req.body.endtime);
  const worktimeVEndtimeCheck = worktimeCheck - endtimeCheck;
  if (worktimeVEndtimeCheck >= 0) {
    return res.status(400).send("Start time must be before the end time.");
  }

  const job = new Jobs({
    ...req.body, //takes elements of the body array and makes them parameters for the function
    owner: req.employer._id,
    clockincode: randomize("Aa0", 5),
    companyname: req.employer.companyname,
    hiringmanager: req.employer.hiringmanager,
    storemanager: req.employer.storemanager,
    storenumber: req.employer.storenumber,
    streetaddress: req.employer.streetaddress,
    city: req.employer.city,
    state: req.employer.state,
    zipcode: req.employer.zipcode,
  });
  // const fcmtoken = req.employer.fcmtoken;

  try {
    const jobs = await job.save();
    // onShiftCreationRestNotify(fcmtoken);
    const message = new Messages({
      title: "New Job Created",
      body: `You have created a new job at ${jobs.createdAt.toLocaleString()}!`,
      owner: req.employer._id,
      ownerModel: "Employer",
    });

    await message.save();
    return res.status(201).send({ success: "Job successfully created." }); //setting the success status and sending the task data
  } catch (e) {
    return res.status(400).send({ error: "Error creating job." }); //setting the http status code to 400 in the event of a client error, must be before send
  }
};

module.exports = createJob;
