const stripe = require("stripe")(
  // This is your test secret API key.
  `${process.env.STRIPE_LIVE_KEY}`,
  {
    apiVersion: "2023-10-16",
  },
);

const sendPayment = async (
  amount,
  stripeConnectedId,
  jobId,
  workerId,
  jobTitle,
  company,
  chargeId,
) => {
  try {
    const transfer = await stripe.transfers.create({
      amount, // 100 USD
      currency: "usd",
      destination: stripeConnectedId, // Worker’s connected account
      metadata: {
        jobId,
        workerId,
      },
      description: `Filled ${jobTitle} position for ${company} on ${new Date(
        company,
      ).toLocaleString()}`,
      source_transaction: chargeId,
    });
    // Log or save payment details
    return transfer;
  } catch (error) {
    console.error("Error Sending Payment :", error);
  }
};

module.exports = sendPayment;
