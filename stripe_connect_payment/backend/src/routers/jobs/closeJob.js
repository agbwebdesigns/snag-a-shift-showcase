const Jobs = require("../../models/job");
const Applications = require("../../models/application");
const finalBillCalc = require("../../controllers/finalBillCalc");
const processPayment = require("../../controllers/createPaymentIntent");
const { application } = require("express");

const closejob = async (req, res) => {
  try {
    let job;
    let application;
    job = await Jobs.findById(req.body.jobId);
    if (!job) {
      return res.status(404).json({ error: "Unable to find a job." });
    }
    try {
      application = await Applications.findOne({ jobid: req.body.jobId });
      if (!application) {
        return res
          .status(404)
          .json({ error: "Unable to find the corresponding application." });
      }
    } catch (error) {}
    if (job.status === "pendingComplete") {
      const billCalc = await finalBillCalc(
        job.clockintime,
        job.clockouttime,
        job.dollarsperhr,
      );
      const {
        workerPayout,
        commissionFee,
        totalCharge,
        stripeFee,
        totalChargeInCents,
      } = billCalc;

      const paymentMethod = await req.employer.stripePaymentMethods.find(
        (method) => method.isDefault,
      )?.paymentMethodID;
      //create a paymentIntent here
      const pi = await processPayment(
        totalChargeInCents,
        req.employer.stripeCustomerId,
        paymentMethod,
        workerPayout,
        commissionFee,
        totalCharge,
        stripeFee,
        job.jobtitle,
        job.worktime,
      );
      if (pi.status === "succeeded") {
        //proceed with stripe.transfer
        try {
          job.status = "pendingPayment";
          job.paymentIntentId = pi.id;
          job.bill.push({
            workerPayout,
            commissionFee,
            processingFee: stripeFee,
            totalCharge,
          });
          await job.save();
        } catch (error) {
          console.error(error);
          return res
            .status(400)
            .json({ error: "Error saving payment information to the job." });
        }
        try {
          application.status = "pendingPayment";
          application.paymentIntentId = pi.id;
          application.bill.push({
            workerPayout,
            commissionFee,
            processingFee: stripeFee,
            totalCharge,
          });
          await application.save();
        } catch (error) {
          console.error(error);
          return res.status(400).json({
            error: "Error saving payment information to the application.",
          });
        }

        //save the paymentIntentId to the job here
      } else if (pi.status === "requires_action") {
      }
      return res
        .status(200)
        .json({ success: "The job has been successfully closed.", billCalc });
    } else if (job.status !== "pendingComplete") {
      return res.status(404).json({
        error: "Incorrect job status, unable to begin payment processing.",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error closing job." });
  }
};

module.exports = closejob;
