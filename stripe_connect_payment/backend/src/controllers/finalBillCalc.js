const finalBillCalc = async (startTime, endTime, dollarsperhr) => {
  // Parse the start and end times into Date objects
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const commissionRate = 0.1;
  const stripeFeeRate = 0.029;
  const stripeFlatFee = 0.3;

  // Calculate the difference in milliseconds
  const diffMilliseconds = endDate - startDate;

  // Convert the difference to minutes, hours, etc.
  const diffSeconds = diffMilliseconds / 1000;
  const diffMinutes = diffSeconds / 60;
  const diffHours = diffMinutes / 60;
  const workerPayout = diffHours * dollarsperhr;
  const commissionFee = workerPayout * commissionRate;
  // Calculate the total charge including the Stripe fee
  const totalCharge =
    (workerPayout + commissionFee + stripeFlatFee) / (1 - stripeFeeRate);
  const stripeFee = totalCharge - (workerPayout + commissionFee);
  const totalChargeInCents = (totalCharge * 100).toFixed(0);
  return {
    workerPayout,
    commissionFee,
    stripeFee,
    totalCharge,
    totalChargeInCents,
  };
};

module.exports = finalBillCalc;
