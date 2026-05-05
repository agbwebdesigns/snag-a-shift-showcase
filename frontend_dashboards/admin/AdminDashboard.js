import { useState, useEffect } from "react";
import JobCreationChart from "./charts/JobCreationChart";
import JobEngagementChart from "./charts/JobEngagementChart";
import JobFillChart from "./charts/JobFillChart";
import RevenueChart from "./charts/RevenueChart";
import DOMPurify from "dompurify";
import { AdminUserInfo } from "../admin-components/AdminUserInfo";

export function AdminDashboard({ token, onDisplaySet, onTokenSet }) {
  const [newUserData, setNewUserData] = useState(null);
  const [activeUserData, setActiveUserData] = useState(null);
  const [averageTimeToFill, setAverageTimeToFill] = useState(null);
  const [workerEmail, setWorkerEmail] = useState(null);
  const [restEmail, setRestEmail] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [restData, setRestData] = useState(null);
  const [suspendWorkerToggle, setSuspendWorkerToggle] = useState(false);
  const [unsuspendWorkerToggle, setUnsuspendWorkerToggle] = useState(false);
  const [suspendRestToggle, setSuspendRestToggle] = useState(false);
  const [reinstateRest, setReinstateRest] = useState(false);
  const [applications, setApplications] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [userToggle, setUserToggle] = useState(false);

  const emailRegex =
    /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|info|biz|edu|gov|mil|us)$/;

  function validateEmail(email) {
    return emailRegex.test(email);
  }

  useEffect(() => {
    handleGetUserGrowthData();
    handleGetActiveUserGrowthData();
    handleGetAverageTimeToFillData();
  }, []);

  function handleSetSuspendWorkerToggle() {
    setSuspendWorkerToggle(!suspendWorkerToggle);
  }

  function handleSetUnsuspendWorkerToggle() {
    setUnsuspendWorkerToggle(!unsuspendWorkerToggle);
  }

  function handleSetSuspendRestToggle() {
    setSuspendRestToggle(!suspendRestToggle);
  }

  function handleSetUnsuspendRestToggle() {
    setReinstateRest(!reinstateRest);
  }

  const handleGetUserGrowthData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/analytics/users/registrations?timeFrame=monthly`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }

      const result = await response.json();

      setNewUserData(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleGetActiveUserGrowthData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/analytics/active-users?timeFrame=monthly`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }

      const result = await response.json();

      setActiveUserData(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleGetAverageTimeToFillData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/analytics/average-time-to-fill-shift?timeFrame=monthly`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }

      const result = await response.json();

      setAverageTimeToFill(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
      onTokenSet(null);
      onDisplaySet(1);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleWorkerSearch = async (email) => {
    const data = { email };

    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = DOMPurify.sanitize(data[key]);
      return acc;
    }, {});

    // Check if any sanitized field is empty and display a notice
    const emptyFields = Object.entries(sanitizedData).filter(
      ([key, value]) => value === "",
    );
    if (emptyFields.length > 0) {
      // Create a message to display which fields are empty
      const message = `The following fields are empty: ${emptyFields
        .map(([key]) => key)
        .join(", ")}`;
      // Display the message on the screen (you can customize this part)
      document.getElementById("error-message").innerText = message;
      const logData = {
        userId: null,
        action: "Malicious Activity Detected",
        description: `DomPurify removed malicious code email field udpate in the admin dashboard. ${message}`,
        userType: "guest",
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/activity-log`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(logData),
          },
        );

        if (!response.ok) {
          throw new Error("Network response is not ok!");
        }

        setWorkerEmail("");
      } catch (e) {
        console.error("error:", e);
      }
      return; // Stop form submission
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/getdata?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
      const result = await response.json();
      setWorkerData(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleRestSearch = async (email) => {
    const data = { email };

    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = DOMPurify.sanitize(data[key]);
      return acc;
    }, {});

    // Check if any sanitized field is empty and display a notice
    const emptyFields = Object.entries(sanitizedData).filter(
      ([key, value]) => value === "",
    );
    if (emptyFields.length > 0) {
      // Create a message to display which fields are empty
      const message = `The following fields are empty: ${emptyFields
        .map(([key]) => key)
        .join(", ")}`;
      // Display the message on the screen (you can customize this part)
      document.getElementById("error-message").innerText = message;
      const logData = {
        userId: null,
        action: "Malicious Activity Detected",
        description: `DomPurify removed malicious code email field udpate in the admin dashboard. ${message}`,
        userType: "guest",
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/activity-log`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(logData),
          },
        );

        if (!response.ok) {
          throw new Error("Network response is not ok!");
        }

        setRestEmail("");
      } catch (e) {
        console.error("error:", e);
      }
      return; // Stop form submission
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/getrestauranteursdata?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
      const result = await response.json();
      setRestData(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleGetApplications = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/getworkerapplications?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
      const result = await response.json();
      setApplications(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleGetJobs = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/getrestaurantjobs?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
      const result = await response.json();
      setJobs(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  function returnAvg(arr) {
    const average = arr.reduce((sum, value) => sum + value, 0);
    return average;
  }

  function returnLocalDate(lastlogin) {
    const newlogin = new Date(lastlogin);
    const localeLogin = newlogin.toLocaleString();
    return localeLogin;
  }

  function handleClearWorkerData() {
    setWorkerData(null);
    setWorkerEmail("");
  }

  function handleClearRestData() {
    setRestData(null);
    setRestEmail("");
  }

  function handleClearJobData() {
    setJobs(null);
  }

  return (
    <div className="dashboard">
      <h1>This is the admin dashboard screen!</h1>
      <div className="admindash-key-metrics">
        <div className="admin-userinfo-button-area">
          <button onClick={() => setUserToggle((prev) => !prev)}>
            Admin User Info
          </button>
        </div>
        {userToggle && <AdminUserInfo token={token} />}
        <hr></hr>
        <p>
          Total New Users:{" "}
          {newUserData
            ? JSON.stringify(newUserData.totalNewUsers)
            : `Loading...`}
        </p>
        <p>
          Total New Workers:{" "}
          {newUserData
            ? JSON.stringify(newUserData.newEmployees)
            : `Loading...`}
        </p>
        <p>
          Total New Restaurants:{" "}
          {newUserData
            ? JSON.stringify(newUserData.newEmployers)
            : `Loading...`}
        </p>
        <hr></hr>
        <p>
          Total Active Users:{" "}
          {activeUserData
            ? JSON.stringify(activeUserData.totalActiveUsers)
            : `Loading...`}
        </p>
        <p>
          Total Active Workers:{" "}
          {activeUserData
            ? JSON.stringify(activeUserData.activeEmployees)
            : `Loading...`}
        </p>
        <p>
          Total Active Restaurants:{" "}
          {activeUserData
            ? JSON.stringify(activeUserData.activeEmployers)
            : `Loading...`}
        </p>
        <hr></hr>
        <div className="chart-panel">
          <h2>Charts: </h2>
          <div className="chart">
            <h3>Revenue</h3>
            <RevenueChart token={token} />
          </div>
          <div className="chart">
            <h3>Job Creation</h3>
            <JobCreationChart token={token} />
          </div>
          <div className="chart">
            <h3>Application Creation</h3>
            <JobEngagementChart token={token} />
          </div>
          <div className="chart">
            <h3>Jobs Filled</h3>
            <JobFillChart token={token} />
            <p>{`Average amount of time to fill a job: ${
              averageTimeToFill && averageTimeToFill.averageTimeToFill !== null
                ? JSON.stringify(averageTimeToFill.averageTimeToFill.toFixed(2))
                : `Loading...`
            } hours.`}</p>
          </div>
        </div>
        <hr></hr>
        <div className="account-search-container">
          <div>
            <label>
              Enter Worker Email to Search: <br></br>
              <input
                type="email"
                value={workerEmail}
                onChange={(e) => setWorkerEmail(e.target.value)}
                required
              />
            </label>
            {validateEmail(workerEmail) && (
              <button onClick={() => handleWorkerSearch(workerEmail)}>
                Search
              </button>
            )}
            {workerData && (
              <div className="admin-worker-data">
                <p>{workerData.employee.username}</p>
                <p>{workerData.employee.email}</p>
                <p>Rating: {returnAvg(workerData.employee.rating)}</p>
                <p>Total Worked Jobs: {workerData.employee.workedjobstotal}</p>
                <p>
                  Last Login: {returnLocalDate(workerData.employee.lastlogin)}
                </p>
                <p>
                  Short Notice Cancels: {workerData.employee.shortnoticecancels}
                </p>
                <p>Suspended: {workerData.employee.suspended.toString()}</p>
                {workerData.employee.suspendedlog.length > 0 ? (
                  <div>
                    <h2>Suspended Log</h2>
                    {workerData.employee.suspendedlog.map((log) => {
                      return (
                        <div key={log._id} className="jobhistory">
                          <p>
                            <b>Suspended By:</b> {log.suspendedby}
                          </p>
                          <p>
                            <b>Reason:</b> {log.suspendedreason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {workerData.employee.workhistory.length > 0 ? (
                  <div>
                    <h2>Worker History</h2>
                    {workerData.employee.workhistory.map((job) => {
                      return (
                        <div key={job._id} className="jobhistory">
                          <p>
                            <b>Position:</b> {job.jobtitle}
                          </p>
                          <p>
                            <b>Employer:</b> {job.employer}
                          </p>
                          <p>
                            <b>From:</b> {job.startdate}
                          </p>
                          <p>
                            <b>To:</b> {job.enddate}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <hr></hr>
                <div>
                  <h2>Applications</h2>
                  {applications === null ? (
                    <p>Load worker applications.</p>
                  ) : applications.length > 0 ? (
                    <p>There are applications!</p>
                  ) : (
                    <p>There are no applications!</p>
                  )}
                  <button
                    onClick={() =>
                      handleGetApplications(workerData.employee._id.toString())
                    }
                  >
                    Load Applications
                  </button>
                </div>
                <hr></hr>
                <div>
                  <div>
                    {!workerData.employee.suspended ? (
                      suspendWorkerToggle ? (
                        <SuspendWorkerConfirm
                          onSetSuspendWorkerField={handleSetSuspendWorkerToggle}
                          token={token}
                          workerEmail={workerData.employee.email}
                        />
                      ) : (
                        <button onClick={() => handleSetSuspendWorkerToggle()}>
                          Suspend Worker
                        </button>
                      )
                    ) : unsuspendWorkerToggle ? (
                      <UnsuspendWorkerConfirm
                        onSetUnsuspendWorkerToggle={
                          handleSetUnsuspendWorkerToggle
                        }
                        token={token}
                        workerEmail={workerData.employee.email}
                      />
                    ) : (
                      <button onClick={() => handleSetUnsuspendWorkerToggle()}>
                        Reactivate Worker Acct.
                      </button>
                    )}
                  </div>
                  <hr></hr>
                  <button onClick={() => handleClearWorkerData()}>
                    Clear Worker Data
                  </button>
                </div>
              </div>
            )}
          </div>
          <hr></hr>
          <div>
            <label>
              Enter Restaurant Email to Search: <br></br>
              <input
                type="email"
                value={restEmail}
                onChange={(e) => setRestEmail(e.target.value)}
                required
              />
            </label>
            {validateEmail(restEmail) && (
              <button onClick={() => handleRestSearch(restEmail)}>
                Search
              </button>
            )}
            {restData && (
              <div className="admin-worker-data">
                <h2>{restData.employer.companyname}</h2>
                <p>
                  <b>Email: </b>
                  {restData.employer.email}
                </p>
                <p>
                  <b>Hiring Manager: </b>
                  {restData.employer.hiringmanager}
                </p>
                <p>
                  <b>Store Manager: </b>
                  {restData.employer.storemanager}
                </p>
                <p>
                  <b>Street Address: </b>
                  <br></br>
                  {restData.employer.streetaddress}
                  {` `}
                  {restData.employer.city}
                  {`, `}
                  {restData.employer.state}
                  {` `}
                  {restData.employer.zipcode}
                </p>
                <p>
                  <b>Phone Number: </b>
                  <a href={`tel:${restData.employer.phonenumber}`}>
                    {restData.employer.phonenumber}
                  </a>
                </p>
                <p>
                  <b>Suspended: </b>
                  {restData.employer.suspended.toString()}
                </p>
                <p>
                  <b>Suspend Log: </b>
                  {restData.employer.suspendedlog.length > 0 ? (
                    restData.employer.suspendedlog.map((log) => {
                      return (
                        <div key={log._id} className="jobhistory">
                          <p>
                            <b>Suspended By: </b>
                            {log.suspendedby}
                          </p>
                          <p>
                            <b>Reason: </b>
                            {log.suspendedreason}
                          </p>
                          <p>
                            <b>Suspended On: </b>
                            {returnLocalDate(log.createdAt)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Records in the log!</p>
                  )}
                </p>
                <hr></hr>
                <div>
                  {jobs === null ? (
                    <p>Load restaurant's open jobs!</p>
                  ) : (
                    jobs.jobs.map((job) => {
                      return (
                        <div key={job._id} className="jobhistory">
                          <h3>{job.companyname}</h3>
                          <p>
                            <b>Job Title: </b>
                            {job.jobtitle}
                          </p>
                          <p>
                            <b>Description:</b>
                            {job.description}
                          </p>
                          <p>
                            <b>Pay: </b>${job.dollarsperhr} per hr
                          </p>
                          <p>
                            <b>Start time:</b>
                            {returnLocalDate(job.worktime)}
                          </p>
                          <p>
                            <b>End Time:</b>
                            {returnLocalDate(job.endtime)}
                          </p>
                        </div>
                      );
                    })
                  )}
                  <button
                    onClick={() =>
                      handleGetJobs(restData.employer._id.toString())
                    }
                  >
                    Load Jobs
                  </button>
                  <button onClick={() => handleClearJobData()}>
                    Clear Jobs
                  </button>
                </div>
                <hr></hr>
                <div>
                  <div>
                    {!restData.employer.suspended ? (
                      suspendRestToggle ? (
                        <SuspendRestConfirm
                          onSetSuspendRestField={handleSetSuspendRestToggle}
                          token={token}
                          restEmail={restData.employer.email}
                        />
                      ) : (
                        <button onClick={() => handleSetSuspendRestToggle()}>
                          Suspend Rest Acct.
                        </button>
                      )
                    ) : reinstateRest ? (
                      <UnsuspendRestConfirm
                        onSetUnsuspendRestToggle={handleSetUnsuspendRestToggle}
                        token={token}
                        restEmail={restData.employer.email}
                      />
                    ) : (
                      <button onClick={() => handleSetUnsuspendRestToggle()}>
                        Reactivate Rest
                      </button>
                    )}
                  </div>
                  <hr></hr>
                  <button onClick={() => handleClearRestData()}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <hr></hr>
        <button className="logout-button" onClick={() => handleLogout()}>
          Logout
        </button>
      </div>
    </div>
  );
}

function UnsuspendWorkerConfirm({
  onSetUnsuspendWorkerToggle,
  token,
  workerEmail,
}) {
  const handleReactivateWorker = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/reactivateworker?email=${workerEmail}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
    <div className="suspend-buttons suspend-worker-confirm">
      <button className="proceed-go" onClick={() => handleReactivateWorker()}>
        Reactivate Confirm
      </button>
      <button
        className="danger-warn"
        onClick={() => onSetUnsuspendWorkerToggle()}
      >
        Cancel
      </button>
    </div>
  );
}

function SuspendWorkerConfirm({ onSetSuspendWorkerField, token, workerEmail }) {
  const [reason, setReason] = useState("");

  const handleSuspendWorker = async () => {
    const body = { suspendedreason: reason };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/suspendworker?email=${workerEmail}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
    <div className="suspend-worker-confirm">
      <label>
        Enter the Reason for Suspension:
        <input
          type="text"
          onChange={(e) => setReason(e.target.value)}
          value={reason}
        />
      </label>
      <div className="suspend-buttons">
        <button className="proceed-go" onClick={() => handleSuspendWorker()}>
          Suspend Confirm
        </button>
        <button
          className="danger-warn"
          onClick={() => onSetSuspendWorkerField()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function UnsuspendRestConfirm({ onSetUnsuspendRestToggle, token, restEmail }) {
  const handleReactivateRest = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/reactivateEmployer?email=${restEmail}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
    <div className="suspend-buttons suspend-worker-confirm">
      <button className="proceed-go" onClick={() => handleReactivateRest()}>
        Reactivate Confirm
      </button>
      <button
        className="danger-warn"
        onClick={() => onSetUnsuspendRestToggle()}
      >
        Cancel
      </button>
    </div>
  );
}

function SuspendRestConfirm({ onSetSuspendRestField, token, restEmail }) {
  const [reason, setReason] = useState("");

  const handleSuspendRest = async () => {
    const body = { suspendedreason: reason };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admins/suspendemployer?email=${restEmail}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://www.snag-a-shift.app",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
    <div className="suspend-worker-confirm">
      <label>
        Enter the Reason for Suspension:
        <input
          type="text"
          onChange={(e) => setReason(e.target.value)}
          value={reason}
        />
      </label>
      <div className="suspend-buttons">
        <button className="proceed-go" onClick={() => handleSuspendRest()}>
          Suspend Confirm
        </button>
        <button className="danger-warn" onClick={() => onSetSuspendRestField()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
