async function handleAccountUpdated(account) {
  if (
    account.requirements.currently_due.includes("individual.dob") ||
    account.requirements.currently_due.includes("individual.ssn_last_4")
  ) {
    let employee;
    try {
      employee = await Employees.findOne({ stripeAccountId: account.id });
      if (!employee) {
        console.error(`Unable to find the employee.`);
        try {
          await logActivity(
            employee._id,
            "Error finding employee during account.updated webhook",
            `There was an error trying to find the employee during the account.updated webhook fire.`,
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
    } catch (error) {
      console.error(
        `Error trying to find id due to missing Stripe onboarding info.`,
      );
    }
    // Send them a friendly reminder email or in-app notice
    try {
      const message = new Messages({
        title: "Check dob and SSN on Stripe.",
        body: `Check your Stripe account settings in your Snag-a-Shift account menu.  Make sure that you have entered your date of birth and the last 4 digits of your SSN.  This information is required by Stripe in order to get paid.`,
        owner: employee._id,
        ownerModel: "Employee",
      });

      await message.save();
    } catch (error) {
      console.error(
        "There was an error sending the Payment Intent Fail message.",
      );
      try {
        await logActivity(
          employee._id,
          "Error Sending webhook Message",
          `There was an error sending the Payment Intent Fail message to ${employee.email} - payment_intent.payment_failed webhook.`,
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
}

module.exports = handleAccountUpdated;
