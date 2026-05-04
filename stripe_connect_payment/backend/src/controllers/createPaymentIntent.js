const stripe = require("stripe")(`${process.env.STRIPE_LIVE_KEY}`, {
  apiVersion: "2023-10-16",
});

const processPayment = async (
  amount,
  stripeCustomerId,
  defaultPaymentMethodId,
  workerPayout,
  commissionFee,
  totalCharge,
  stripeFee,
  jobTitle,
  worktime,
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      customer: stripeCustomerId,
      payment_method: defaultPaymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        worker_payout: workerPayout.toFixed(2),
        commission_fee: commissionFee.toFixed(2),
        processing_fee: stripeFee.toFixed(2),
        total_charge: totalCharge.toFixed(2),
        job_worked: jobTitle,
        job_start_time: new Date(worktime).toLocaleString(),
      },
    });

    // Log or save payment details
    return paymentIntent;
  } catch (error) {
    console.error("Payment processing error:", error);
  }
};

module.exports = processPayment;
