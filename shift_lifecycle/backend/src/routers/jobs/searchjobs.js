const Jobs = require("../../models/job");
const distance = require("../../controllers/fetchdistance");
const he = require("he");

// an employee can search all of the jobs

const searchJobs = async (req, res) => {
  const companyname = req.query.companyname
    ? req.query.companyname
    : /[\w+\s]+/g;

  const jobtitle = req.query.jobtitle ? req.query.jobtitle : /[\w+\s]+/g;
  const userCity = req.query.city; // Get user city from query parameters
  const clientPlaceId = req.query.clientLocation; // Get user's place_id

  // Sorting parameters
  const sortBy = req.query.sortBy || "pay"; // default sort by pay
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // default order is ascending
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

  try {
    const jobs = await Jobs.aggregate([
      {
        $match: {
          openjob: true,
          companyname,
          jobtitle,
          ...(userCity && {
            city: { $regex: new RegExp(`^${userCity}$`, "i") },
          }), // Include city filter only if userCity is provided
          $expr: {
            $gte: [
              { $dateFromString: { dateString: "$worktime" } },
              new Date(Date.now() + 60 * 60 * 1000), // One hour from now
            ],
          }, // Jobs starting at least 1 hour from now
        },
      },
      {
        $addFields: {
          totalWorkTime: {
            $divide: [
              {
                $subtract: [
                  { $dateFromString: { dateString: "$endtime" } },
                  { $dateFromString: { dateString: "$worktime" } },
                ],
              },
              3600000, // Convert milliseconds to hours
            ],
          },
        },
      },
      {
        $addFields: {
          totalAmountEarned: {
            $multiply: ["$totalWorkTime", "$dollarsperhr"],
          },
          normalizedJobTitle: { $toLower: "$jobtitle" }, // Normalize job title case
        },
      },
      {
        $project: {
          companyname: 1,
          jobtitle: 1,
          description: 1,
          dollarsperhr: 1,
          worktime: 1,
          endtime: 1,
          hiringmanager: 1,
          storemanager: 1,
          storenumber: 1,
          streetaddress: 1,
          city: 1,
          state: 1,
          zipcode: 1,
          clockincode: 1,
          openjob: 1,
          skills: 1,
          rating: 1,
          totalAmountEarned: 1,
          createdAt: 1,
        },
      },
    ]);
    let sortedJobs = jobs;

    if (sortBy === "distance" && clientPlaceId) {
      // Calculate distances for all jobs
      const distances = await distance(clientPlaceId, jobs);
      // Sort jobs by distance
      sortedJobs = distances
        .map((item) => ({
          ...item.job,
          distance: item.distance,
        }))
        .sort((a, b) => (a.distance - b.distance) * sortOrder);
    } else {
      // Sort jobs by other criteria
      if (sortBy === "totalAmountEarned") {
        sortedJobs.sort(
          (a, b) => (a.totalAmountEarned - b.totalAmountEarned) * sortOrder,
        );
      } else {
        switch (sortBy) {
          case "pay":
            sortedJobs.sort(
              (a, b) => (a.dollarsperhr - b.dollarsperhr) * sortOrder,
            );
            break;
          case "jobtitle":
            sortedJobs.sort(
              (a, b) =>
                a.normalizedJobTitle.localeCompare(b.normalizedJobTitle) *
                sortOrder,
            );
            break;
          case "rating":
            sortedJobs.sort((a, b) => (a.rating - b.rating) * sortOrder);
            break;
          case "createdAt":
            sortedJobs.sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return (dateA - dateB) * sortOrder;
            });
            break;
          default:
            sortedJobs.sort(
              (a, b) => (a.dollarsperhr - b.dollarsperhr) * sortOrder,
            ); // default case
        }
      }
    }

    // Apply pagination
    const skip = req.query.skip && parseInt(req.query.skip);
    const limit = req.query.limit && parseInt(req.query.limit);
    const paginatedJobs = sortedJobs.slice(skip, skip + limit);
    const sanitized = sanitizeArray(paginatedJobs);

    return res.status(200).send(sanitized);
  } catch (e) {
    return res.status(500).send({ error: "Error retrieving jobs." });
  }
};

module.exports = searchJobs;
