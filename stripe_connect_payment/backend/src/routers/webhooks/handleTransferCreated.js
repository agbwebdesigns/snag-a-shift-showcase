// Transfer Events
const handleTransferCreated = async (transfer, req, res) => {
  //update the transfer id in the job and application schema
  let job;
  let application;
  try {
    job = await Jobs.findById(transfer.metadata.jobId);
    job.transferId = transfer.id;
  } catch (error) {
    return res.status(500).send("Error updating job transfer id data.");
  }
  try {
    application = await Applications.findOne({ job: job._id });
    application.transferId = transfer.id;
  } catch (error) {
    return res.status(500).send("Error updating application transfer id data.");
  }
  try {
    await Promise.all([job.save(), application.save()]);
    return res.status(200).send("Job and application set to paid status");
  } catch (error) {
    console.error("Error saving documents:", error);
    return res.status(500).send("Error saving transfer ID data.");
  }
};

module.exports = handleTransferCreated;
