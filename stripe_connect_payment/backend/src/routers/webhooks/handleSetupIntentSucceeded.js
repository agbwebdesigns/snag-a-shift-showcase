async function handleSetupIntentSucceeded(setupIntent) {
  // Save payment method or notify customer
  const { customer } = setupIntent;
  let employer;
  try {
    employer = await Employers.findOne({ stripeCustomerId: customer });
  } catch (error) {
    console.error("Unable to find the employer account.");
    try {
      await logActivity(
        employer._id,
        "Error Finding employer account",
        `There was an error trying to find the employer account to send a payment setup intent success message to the restaurant account, ${customer} - setupIntentSuccedded webhook.`,
        "Stripe Webhook",
        getNormalizedIp(req),
      );
    } catch (error) {
      console.error(
        "There was a problem creating an activity log on fail to find employer account.",
      );
    }
    return;
  }
  try {
    const message = new Messages({
      title: "Payment Setup Success!",
      body: `You have successfully setup your payment method.`,
      owner: employer._id,
      ownerModel: "Employer",
    });

    await message.save();
  } catch (error) {
    console.error(
      "There was an error sending the Payment Setup Success message.",
    );
    try {
      await logActivity(
        employer._id,
        "Error Sending webhook Message",
        `There was an error sending the Payment Setup Success message to ${employer.email} - setupIntentSuccedded webhook.`,
        "Stripe Webhook",
        getNormalizedIp(req),
      );
    } catch (error) {
      console.error(
        "There was a problem creating an activity log on Payment Setup Success message send fail.",
      );
    }
    return;
  }
}

module.exports = handleSetupIntentSucceeded;
