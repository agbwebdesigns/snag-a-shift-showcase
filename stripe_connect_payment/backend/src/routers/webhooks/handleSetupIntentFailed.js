async function handleSetupIntentFailed(setupIntent) {
  console.error("SetupIntent failed:", setupIntent);
  const { customer } = setupIntent;
  let employer;
  // Handle failure adding payment method response, send a message to the user.
  try {
    employer = await Employers.findOne({ stripeCustomerId: customer });
  } catch (error) {
    console.error("Unable to find the employer account.");
    try {
      await logActivity(
        employer._id,
        "Error Finding employer account",
        `There was an error trying to find the employer account to send a payment setup intent fail message to the restaurant account, ${customer} - setupIntentFailed webhook.`,
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
      title: "Payment Setup Failure.",
      body: `There was an error setting up your payment method.`,
      owner: employer._id,
      ownerModel: "Employer",
    });

    await message.save();
  } catch (error) {
    console.error("There was an error sending the Payment Setup Fail message.");
    try {
      await logActivity(
        employer._id,
        "Error Sending webhook Message",
        `There was an error sending the Payment Setup Fail message to ${employer.email} - setupIntentFailed webhook.`,
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

module.exports = handleSetupIntentFailed;
