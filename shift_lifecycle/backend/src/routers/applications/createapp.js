const Applications = require("../../models/application");
const Jobs = require("../../models/job");
const Messages = require("../../models/messages");
const he = require("he");

const average = (arr) => {
  if (arr.length === 0) return 0; // Handling empty array
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
};

const createapp = async (req, res) => {
  try {
    let job;
    let message;
    try {
      job = await Jobs.findById(req.params.id);
    } catch (error) {
      return res.status(404).send({ error: "Unable to find the job." });
    }
    const application = new Applications({
      name: req.employee.username,
      employeeid: req.params.employeeid,
      jobid: req.params.id,
      owner: req.employee._id,
      job: req.params.id,
      rating: average(req.employee.rating),
      workedjobstotal: req.employee.workedjobstotal,
      workhistory: req.employee.workhistory,
      avatar: req.employee.avatar,
      worktime: job.worktime,
      endtime: job.endtime,
    });

    const existingApplications = await Applications.find({
      owner: req.employee._id,
      active: false,
      completed: false,
    });
    if (existingApplications.length > 0) {
      const alreadyApplied = existingApplications.some((app) => {
        return String(app.jobid) === String(req.params.id);
      });
      if (alreadyApplied) {
        return res.status(403).send("You have applied for this job already.");
      }

      const isConflict = existingApplications.some((existingApp) => {
        // Check only applications that are not active and not disabled
        // Calculate buffered start and end times for the existing application
        const workTime = new Date(existingApp.worktime).getTime();
        const endTime = new Date(existingApp.endtime).getTime();
        const jobWorkTime = new Date(application.worktime).getTime();
        const jobEndTime = new Date(application.endtime).getTime();

        const safeAfter = jobWorkTime > endTime + 60 * 60 * 1000;
        const safeBefore = jobEndTime < workTime - 60 * 60 * 1000;

        //check if the newapplication worktime and endtimes conflict with existing application times at all
        return !(safeAfter || safeBefore);
      });

      if (isConflict) {
        return res
          .status(409)
          .send("There is a scheduling conflict with another application.");
      } else if (!isConflict) {
        message = new Messages({
          title: "New Application Created",
          body: `You've' applied for a job!`,
          owner: req.employee._id,
          ownerModel: "Employee",
        });
      }
    } else if (existingApplications.length === 0) {
      message = new Messages({
        title: "New Application Created",
        body: `You've' applied for a job!`,
        owner: req.employee._id,
        ownerModel: "Employee",
      });
    }

    try {
      await Promise.all([application.save(), message.save()]);
      return res
        .status(201)
        .send({ success: "Application Created Successfully." }); //setting the success status and sending the task data
    } catch (error) {
      console.error("Application Save Error:", error);
      return res.status(500).send(`Failed to save application, ${error}`);
    }
  } catch (error) {
    console.error(`Error in application creation process: ${error.message}`);
    return res.status(400).send({ error: error.message }); //setting the http status code to 400 in the event of a client error, must be before send
  }
};

module.exports = createapp;
