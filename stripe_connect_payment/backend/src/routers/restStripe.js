const express = require("express");
const auth = require("../middleware/employerAuth");
const stripe = require("stripe")(
  // This is your test secret API key.
  `${process.env.STRIPE_LIVE_KEY}`,
  {
    apiVersion: "2023-10-16",
  },
);
const Employees = require("../models/employee");
const Applications = require("../models/application");
const Jobs = require("../models/job");
const sendPayment = require("../controllers/createTransfer");

const router = new express.Router();
exports.router = router;

router.post("/stripe/create-setup-intent", auth, async (req, res) => {
  const { stripeCustomerId } = req.employer;

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
    });

    return res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating SetupIntent:", error);
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
