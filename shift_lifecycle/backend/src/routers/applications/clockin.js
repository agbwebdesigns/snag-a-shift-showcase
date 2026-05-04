const Applications = require("../../models/application");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { logActivity } = require("../../controllers/logactivity");
const getNormalizedIp = require("../../controllers/getnormalizedip");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const clockin = async (req, res) => {
  //endpoint is for employee to clock into work
  const updates = Object.keys(req.body.scheduler); //returns the keys of the Object being searched, in this case the request body
  const allowedUpdates = ["clockincode"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

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

    // logging the activity
    await logActivity(
      req.employee._id,
      "Malicious Activity Detected",
      "Upload of malicous code attempted to the clockin.js endpoint, Server detected and thwarted.",
      "employee",
      getNormalizedIp(req),
    );

    // Send error response back to the client
    return res.status(400).json({ error: message });
  }

  try {
    await req.employee.populate({ path: "applications" });
    if (
      req.body.scheduler.clockincode !== req.employee.applications.clockincode
    ) {
      return res.status(400).send({ error: "Invalid Clock-In Code!" });
    }
  } catch (e) {
    return res.status(400).send({ error: "Error updating application." });
  }

  const worktime = new Date(req.employee.applications[0].worktime);
  const milWorkTime = worktime.getTime();
  const dateCheck = new Date();
  const anotherCheck = dateCheck.getTime();
  const finalCheck = milWorkTime - anotherCheck;
  // if the time is 10 minutes before or 10 minutes after work start time
  if (finalCheck < 600000 && finalCheck > -600000) {
    // if the employee hasn't clocked in already
    if (!req.employee.applications[0].clockintime) {
      const appid = req.employee.applications[0]._id.toString();

      try {
        const application = await Applications.findById(appid);
        if (!application) {
          return res.status(404).send();
        }
        application.clockintime = dateCheck;
        await application.save();
      } catch (e) {
        return res.status(400).send();
      }
    } else {
      return res.status(404).send("You have already clocked in!");
    }
  } else {
  }
  const backwardsCheck = anotherCheck - milWorkTime;
  return res.status(200).send();
};

module.exports = clockin;
