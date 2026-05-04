async function handlePaymentIntentSucceeded(paymentIntent) {
  // Fulfill the order or grant service access
  const workerPayout = parseFloat(paymentIntent.metadata.worker_payout) * 100;
  const latest_charge = paymentIntent.latest_charge;
  let application;
  try {
    application = await Applications.findOne({
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Unable to find the correct application.");
  }
  let employee;
  try {
    employee = await Employees.findById(application.owner);
  } catch (error) {
    console.error("Unable to find the worker who completed this job.");
  }
  let job;
  try {
    job = await Jobs.findById(application.jobid);
  } catch (error) {
    console.error("Unable to find the job.");
    return;
  }
  await sendPayment(
    workerPayout.toFixed(0),
    employee.stripeAccountId,
    application.jobid,
    employee._id.toString(),
    application.jobtitle,
    job.companyname,
    latest_charge,
  );
}

module.exports = handlePaymentIntentSucceeded;
