import { useEffect, useState } from "react";

export function ViewJobApplications({
  onDisplaySet,
  data,
  onViewOpenJobs,
  token,
  onDataSet,
  onGetApplications,
}) {
  const [sortBy, setSortBy] = useState("rating");
  const [initMount, setInitMount] = useState(true);

  useEffect(() => {
    if (initMount) {
      setInitMount(!initMount);
    } else {
      handleGetApplications(data[0].job);
    }
  }, [sortBy]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  async function handleSelectEmployee(empid, jobid) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/${empid}/${jobid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
    } catch (e) {
      console.error("error:", e);
    }
    onDisplaySet(14); //return to the open jobs window
  }

  async function handleGetApplications(jobid) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/jobapplications/${jobid}?sortBy=${sortBy}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }

      const result = await response.json();
      const stringyResult = JSON.stringify(result);
      onDataSet(stringyResult);
    } catch (e) {
      console.error("error:", e);
    }
  }

  return (
    <div>
      <h1>Here are the applications for this job!</h1>
      <div className="back-button-area">
        <button
          className="dashboard-back"
          onClick={() => onViewOpenJobs(true, 14, false, "week")}
        >
          ◀
        </button>
        <div className="back-button-area">
          <select value={sortBy} onChange={handleSortChange}>
            <option value="rating">Rating</option>
            <option value="workedjobstotal">Worked Jobs Total</option>
            <option value="workHistoryCount">Completed Jobs Count</option>
            <option value="currentEmployer">Currently Employed</option>
          </select>
        </div>
      </div>
      <div className="job-list">
        {data.map((data) => {
          return (
            <li key={data._id} className="job-card">
              {data.avatar && (
                <img
                  className="avatar"
                  alt="Worker Headshot"
                  src={URL.createObjectURL(
                    new Blob([new Uint8Array(data.avatar.data)], {
                      type: "image/png",
                    }),
                  )}
                />
              )}
              <p>{data.name}</p>
              <p>
                Rating:{" "}
                {data.rating !== undefined ? data.rating.toFixed(2) : ""}
              </p>
              <p>Total jobs worked: {data.workedjobstotal}</p>
              <hr></hr>
              <div>
                <h2>Previous Work:</h2>
                {data.workhistory !== undefined
                  ? data.workhistory.map((job) => {
                      return (
                        <div
                          key={job._id.toString()}
                          className="jobhistory-app"
                        >
                          <p>{job.jobtitle}</p>
                          <p>{job.employer}</p>
                          <p>{job.startdate}</p>
                          <p>{job.enddate}</p>
                        </div>
                      );
                    })
                  : ""}
              </div>
              <button
                className="job-button"
                onClick={() =>
                  handleSelectEmployee(data.owner._id.toString(), data.jobid)
                }
              >
                Hire Me!
              </button>
            </li>
          );
        })}
      </div>
    </div>
  );
}
