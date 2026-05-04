const express = require("express");
const auth = require("../middleware/employerAuth");
const stripe = require("stripe")(`${process.env.STRIPE_LIVE_KEY}`, {
  apiVersion: "2023-10-16",
});
const Employees = require("../models/employee");
const Employers = require("../models/employer");
const Applications = require("../models/application");
const Jobs = require("../models/job");
const sendPayment = require("../controllers/createTransfer");
const Messages = require("../models/messages");
const { logActivity } = require("../controllers/logactivity");
const getNormalizedIp = require("../controllers/getnormalizedip");
const handleAccountUpdated = require("./webhooks/handleAccountUpdated");
const handlePaymentIntentSucceeded = require("./webhooks/handlePaymentIntentSucceeded");
const handlePaymentIntentFailed = require("./webhooks/handlePaymentIntentFailed");
const handleSetupIntentSucceeded = require("./webhooks/handleSetupIntentSucceeded");
const handleSetupIntentFailed = require("./webhooks/handleSetupIntentFailed");
const handleTransferCreated = require("./webhooks/handleTransferCreated");

const router = new express.Router();
exports.router = router;

// Webhook endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Parse raw body for Stripe signature verification
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // Verify the event by checking its signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Switch case to handle different event types
    switch (event.type) {
      // Account Events
      case "account.updated":
        handleAccountUpdated(event.data.object);
        break;
      // Payment Intent Events
      case "payment_intent.succeeded":
        handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        handlePaymentIntentFailed(event.data.object, req, res);
        break;

      //Setup Intent Events
      case "setup_intent.succeeded":
        handleSetupIntentSucceeded(event.data.object);
        break;

      case "setup_intent.setup_failed":
        handleSetupIntentFailed(event.data.object);
        break;

      //Balance Available Events
      case "balance.available":
        handleBalanceAvailable(event.data.object);
        break;

      // Transfer events
      case "transfer.created":
        await handleTransferCreated(event.data.object, req, res);
        break;
      case "transfer.reversed":
        await handleTransferReversed(event.data.object);
        break;
      case "transfer.updated":
        await handleTransferUpdated(event.data.object);
        break;

      // Payout events
      case "payout.created":
        await handlePayoutCreated(event.data.object);
        break;
      case "payout.paid":
        await handlePayoutPaid(event.data.object);
        break;
      case "payout.failed":
        await handlePayoutFailed(event.data.object);
        break;
      case "payout.updated":
        await handlePayoutUpdated(event.data.object);
        break;

      default:
    }

    // Respond to Stripe to acknowledge receipt of the event
    return res.status(200).send();
  },
);

// Helper functions for event handling

const handleBalanceAvailable = (balance) => {
  //Not needed
};

// Handle when a transfer is reversed
const handleTransferReversed = async (transfer) => {
  console.error("Transfer reversed:", transfer);
  // Notify the connected account and log the reversal
};

// Handle updates to transfer status or metadata
const handleTransferUpdated = async (transfer) => {
  // Track changes or reconcile with your records
};

// Payout Events
const handlePayoutCreated = async (payout) => {
  // Add logic to update the job and application status to paid
};

const handlePayoutPaid = async (payout) => {
  // Mark the payout as completed and notify the worker.
};

const handlePayoutFailed = async (payout) => {
  console.error("Payout failed:", payout);
  // Notify the connected account and log the error for troubleshooting.
};

const handlePayoutUpdated = async (payout) => {
  // Handle retries or status changes for the payout.
};

module.exports = router;
