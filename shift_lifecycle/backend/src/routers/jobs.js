const express = require("express");
const auth = require("../middleware/employerAuth");
const router = new express.Router();

const createJob = require("./jobs/createjob");
const searchJobs = require("./jobs/searchjobs");
const selectEmployee = require("./jobs/selectemployee");
const closeJob = require("./jobs/closeJob");

router.post("/jobs", auth, async (req, res) => {
  //creates a new job
  createJob(req, res);
});

router.get("/job/search", async (req, res) => {
  // an employee can search all of the jobs
  searchJobs(req, res);
});

router.patch("/jobs/:empid/:jobid", auth, async (req, res) => {
  //an employer selects an employee for a job
  // the job info is saved to the employee scheduler and the employee info is saved to the job scheduler
  // employees other applications are disabled
  // all other apps for the job are disabled
  selectEmployee(req, res);
});

router.patch("/jobs/close-job", auth, async (req, res) => {
  closeJob(req, res);
});

module.exports = router;
