const Employees = require("../../models/employee");
const Jobs = require("../../models/job");
const Applications = require("../../models/application");
const {
  onWorkerHiredRestNotify,
  onWorkerHiredWorkerNotify,
} = require("../../controllers/messages");
const Messages = require("../../models/messages");

const selectEmployee = async (req, res) => {
  const _id = req.params.jobid;
  const employeeid = req.params.empid;

  try {
    //make sure the employee exists
    const employee = await Employees.findById(employeeid).populate({
      path: "applications",
    });
    if (!employee) {
      return res.status(404).send("No employee found!");
    }

    //find the job
    const job = await Jobs.findOne({
      _id: req.params.jobid,
      owner: req.employer._id,
    }).populate({
      path: "applications",
    }); //finds this job by id but, takes into account the owner as well

    if (!job) {
      //if there is no job found
      return res.status(404).send();
    }

    //save employee to the job scheduler
    job.scheduledEmployee = { employeeid, employeename: employee.username };
    job.openjob = false;
    if (job.status === "openJob") {
      job.status = "filled";
    }
    await job.save();

    const jobBeingSaved = {
      jobid: req.params.jobid,
      jobtitle: job.jobtitle,
      description: job.description,
      worktime: job.worktime,
    };
    //save job to employee scheduler
    employee.scheduler.push(jobBeingSaved);
    await employee.save();

    const empApplications = await Applications.find({
      //find all applications virtually connected to a specific employee
      owner: req.params.empid,
      active: false,
    });
    if (!empApplications) {
      res.status(404).send();
    }

    //map through the applications owned by a specific employee
    empApplications.map(async (jobapp) => {
      if (jobapp.jobid === req.params.jobid) {
        //if this is the application you are looking for
        jobapp.active = true;
        jobapp.jobid = req.params.jobid;
        jobapp.jobtitle = job.jobtitle;
        jobapp.description = job.description;
        jobapp.worktime = job.worktime;
        jobapp.endtime = job.endtime;
        jobapp.dollarsperhr = job.dollarsperhr;
        if (jobapp.status === "openJob") {
          jobapp.status = "filled";
        }
        await jobapp.save();
      } else if (jobapp.jobid !== req.params.jobid) {
        //if this is not the application you are looking for
        jobapp.disabled = true;
        await jobapp.save();
      }
    });

    const jobApplications = await Applications.find({
      //find all applications virtually connected to a specific job
      job: req.params.jobid,
    });
    if (!jobApplications) {
      return res.status(404).send({ error: "No applications found." });
    }

    jobApplications.map(async (app) => {
      if (app.owner.toString() === req.params.empid) {
        app.active = true;
        await app.save();
      } else if (app.owner.toString() !== req.params.empid) {
        app.disabled = true;
        await app.save();
      }
    });

    // onWorkerHiredRestNotify(req.employer.fcmtoken);
    employee.fcmtoken && onWorkerHiredWorkerNotify(employee.fcmtoken);
    const inAppMessages = [
      new Messages({
        title: "Worker Selected",
        body: `You have selected a worker for work!`,
        owner: req.employer._id,
        ownerModel: "Employer",
      }),
      new Messages({
        title: "You've been hired!",
        body: `You've been hired for work!`,
        owner: employeeid,
        ownerModel: "Employee",
      }),
    ];

    await Promise.all(inAppMessages.map((message) => message.save()));

    return res.status(200).send({ success: "Worker Selected." });
  } catch (e) {
    return res.status(400).send({ error: "Error selecting worker." });
  }
};

module.exports = selectEmployee;
