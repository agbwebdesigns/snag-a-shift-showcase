async function handlePaymentIntentFailed(paymentIntent) {
  // Notify customer of need to update the payment method and send an activity log of payment intent failed
  const { customer } = paymentIntent;
  let employer;
  try {
    employer = await Employers.findOne({
      stripeCustomerId: customer,
    });
  } catch (error) {
    console.error(
      "Unable to find the employer account on payment intent failed webhook.",
    );
    try {
      await logActivity(
        employer._id,
        "Error Finding employer account",
        `There was an error trying to find the employer account to send a payment intent failed message to the restaurant account, ${customer} - payment_intent.payment_failed webhook.`,
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
      title: "Payment method issue.",
      body: `There was an issue with your payment method while creating a payment.  Please update your payment method to complete the job.`,
      owner: employer._id,
      ownerModel: "Employer",
    });

    await message.save();
  } catch (error) {
    console.error(
      "There was an error sending the Payment Intent Fail message.",
    );
    try {
      await logActivity(
        employer._id,
        "Error Sending webhook Message",
        `There was an error sending the Payment Intent Fail message to ${employer.email} - payment_intent.payment_failed webhook.`,
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

module.exports = handlePaymentIntentFailed;
