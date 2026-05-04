const Jobs = require("../../models/job");
const he = require("he");

const getjobapps = async (req, res) => {
  // employer gets the applications owned by a specific job
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // -1 for descending, 1 for ascending
  }

  try {
    const jobList = await Jobs.findById(req.params.id).populate({
      path: "applications",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
      populate: {
        path: "owner",
        select: "name",
      },
    });

    // Transform applications to add computed fields
    const applications = jobList.applications.map((application) => ({
      ...application._doc,
      workHistoryCount: application.workhistory
        ? application.workhistory.length
        : 0,
      currentEmployer: application.workhistory
        ? application.workhistory.some((wh) => wh.currentemployer)
        : false,
    }));

    // Sort applications based on computed fields if needed
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      const sortField = parts[0];
      const sortOrder = parts[1] === "desc" ? -1 : 1;

      if (["workHistoryCount", "currentEmployer"].includes(sortField)) {
        applications.sort(
          (a, b) => (a[sortField] > b[sortField] ? 1 : -1) * sortOrder,
        );
      }
    }

    function sanitizeArray(arr) {
      return arr.map((obj) => {
        return Object.keys(obj).reduce((acc, key) => {
          const value = obj[key];
          // Only encode if the value is a string
          acc[key] = typeof value === "string" ? he.encode(value) : value;
          return acc;
        }, {});
      });
    }
    const sanitized = sanitizeArray(applications);

    return res.status(200).send(sanitized);
  } catch (e) {
    return res
      .status(500)
      .send({ error: "Error retrieving Job Applications." });
  }
};

module.exports = getjobapps;
