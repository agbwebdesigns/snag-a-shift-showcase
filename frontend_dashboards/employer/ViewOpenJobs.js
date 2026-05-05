import { DashboardBack } from "../buttons/DashboardBack";
import { useEffect, useState } from "react";

export function ViewOpenJobs({
  onDisplaySet,
  token,
  onViewOpenJobs,
  onGetApplications,
}) {
  const [data, setData] = useState([]);
  const [time, setTime] = useState("week");
  const [completed, setCompleted] = useState(false);
  const [openjob, setOpenJob] = useState(true);
  const [deleteToggle, setDeleteToggle] = useState(false);
  const [limit, setLimit] = useState(5);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    async function handleViewOpenJobs(openjob, completed, time, limit, skip) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/jobs?time=${time}&completed=${completed}&openjob=${openjob}&limit=${limit}&skip=${skip}`,
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
        setData(result);
      } catch (e) {
        console.error("error:", e);
      }
    }
    handleViewOpenJobs(openjob, completed, time, limit, skip);
  }, [time, openjob, completed, token, deleteToggle, limit, skip]);

  function toLocalTime(time) {
    const date = new Date(time);
    const localDate = date.toLocaleString();
    return localDate;
  }

  async function handleDeleteJob(jobid) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/${jobid}`,
        {
          method: "DELETE",
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
      setDeleteToggle((prev) => !prev);
    } catch (e) {
      console.error("error:", e);
    }
  }

  const handleIncSkip = (skip) => {
    const newSkip = skip + 5;
    setSkip(newSkip);
  };

  const handleDecSkip = (skip) => {
    setSkip(skip - 5);
  };

  return (
    <div>
      <h1>Here are your open jobs!</h1>
      <div className="back-button-area">
        <DashboardBack onDisplaySet={onDisplaySet} screen={7}>
          ◀
        </DashboardBack>
        <div>
          <button onClick={() => handleDecSkip(skip)}>◀</button>
          <button onClick={() => handleIncSkip(skip)}>▶</button>
        </div>
      </div>
      <ul className="job-list">
        {data.map((data) => (
          <li key={data.createdAt}>
            <div className="job-card">
              <h1>{data.companyname}</h1>
              <label>
                The Job:
                <p>{data.jobtitle}</p>
                <p>{data.description}</p>
                <p>${data.dollarsperhr} per hour</p>
              </label>
              <br />
              <label>
                Start-time/End-time:
                <p>{toLocalTime(data.worktime)}</p>
                <p>{toLocalTime(data.endtime)}</p>
              </label>
              <br />
              <label>
                Hiring Manager: <p>{data.hiringmanager}</p>
              </label>
              <label>
                Store Manager: <p>{data.storemanager}</p>
              </label>
              <label>
                Location Information:
                <p>{data.streetaddress}</p>
                <p>
                  {data.city} {data.state}, {data.zipcode}
                </p>
                <p>{data.storenumber}</p>
              </label>
              <div className="job-button-container">
                <button
                  className="job-button danger-warn"
                  onClick={() => handleDeleteJob(data._id)}
                >
                  Delete this Job
                </button>
                {data.openjob === true ? (
                  <button
                    className="job-button proceed-go"
                    onClick={() => onGetApplications(data._id)}
                  >
                    View Applications for this Job
                  </button>
                ) : (
                  <p>This job is Scheduled!</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
