const Applications = require("../../models/application");

const clockout = async (req, res) => {
  // employee clocks out
  const applications = await Applications.findOne({
    //find the application owned by a specific employee for a specific job
    owner: req.employee._id,
    job: req.params.jobid,
  });
  if (!applications) {
    res.status(404).send();
  } else {
  }

  try {
    await req.employee.populate({ path: "applications" });
    if (
      req.employee.applications[0].clockintime &&
      !req.employee.applications[0].clockouttime
    ) {
      applications.clockouttime = new Date();
      await applications.save();
      // clock the employee out, end the job
    } else if (
      !req.employee.applications[0].clockintime ||
      req.employee.applications[0].clockouttime
    ) {
      // end the job
    }

    res.send(applications);
  } catch (e) {
    res.status(500).send({ e });
  }
};

module.exports = clockout;
