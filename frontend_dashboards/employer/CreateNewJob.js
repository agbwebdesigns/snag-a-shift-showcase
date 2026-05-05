import { useEffect, useState } from "react";
import { DashboardBack } from "../buttons/DashboardBack";
import DOMPurify from "dompurify";

const jobOptions = {
  busser: "Responsible for cleaning tables and maintaining dining area.",
  dishwasher: "Washes dishes and kitchen equipment.",
  host: "Greets guests and manages reservations.",
  "appetizer cook": "Prepares appetizers and ensures food quality.",
};

export function CreateNewJob({ onDisplaySet, token, userId }) {
  const [jobtitle, setJobtitle] = useState("busser");
  const [description, setDescription] = useState(
    "Responsible for cleaning tables and maintaining dining area.",
  );
  const [dollarsPerHr, setDollarsPerHr] = useState("");
  const [worktime, setWorktime] = useState("");
  const [minWorkTime, setMinWorkTime] = useState("");
  const [endtime, setEndtime] = useState("");
  const [minEndTime, setMinEndTime] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [displayStart, setDisplayStart] = useState("");
  const [displayEnd, setDisplayEnd] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("busser");

  const jobTitleRegex = /^([a-zA-z]\s*){1,30}$/;
  const descriptionRegex = /^(?!\s*$)[A-Za-z0-9.,!?'"()\- ]{1,256}$/;
  const wageRegex = /^\d{1,3}$/;

  useEffect(() => {
    const now = new Date();
    const leadTimeMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const futureTime = new Date(now.getTime() + leadTimeMilliseconds); // Add 24 hours

    // Format as 'YYYY-MM-DDTHH:mm' for datetime-local input
    const year = futureTime.getFullYear();
    const month = String(futureTime.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(futureTime.getDate()).padStart(2, "0");
    const hours = String(futureTime.getHours()).padStart(2, "0");
    const minutes = String(futureTime.getMinutes()).padStart(2, "0");

    const formattedFutureTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setMinWorkTime(formattedFutureTime);
  }, [minWorkTime]);

  function validateJobTitle(title) {
    return jobTitleRegex.test(jobtitle);
  }

  function validateDescription(desc) {
    return descriptionRegex.test(description);
  }

  function validateWage(wage) {
    return wageRegex.test(dollarsPerHr);
  }

  function onDescriptionChange(e) {
    const userInput = e.target.value;
    setDescription(userInput);
  }

  const validateTimes = (start, end) => {
    // Convert to Date objects for comparison
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate < endDate; // Check if start time is before end time
  };

  // Handle Start Time Change
  const handleStartTimeChange = (e) => {
    const inputTime = new Date(e.target.value);
    const minTime = new Date(minWorkTime); // Use the pre-calculated minWorkTime
    if (inputTime < minTime) {
      setError("Start time cannot be in the past.");
      setWorktime("");
      setMinEndTime(""); // Reset stop time minimum
    } else {
      setError("");
      setDisplayStart(e.target.value);
      // Get the user's timezone offset in minutes
      const timezoneOffset = -inputTime.getTimezoneOffset(); // Offset in minutes
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
        .toString()
        .padStart(2, "0");
      const offsetMinutes = (Math.abs(timezoneOffset) % 60)
        .toString()
        .padStart(2, "0");

      const timezone = `UTC${
        timezoneOffset >= 0 ? "+" : "-"
      }${offsetHours}:${offsetMinutes}`;

      // Append the timezone offset to the worktime
      const formattedWorktime = `${e.target.value}`;
      setWorktime(formattedWorktime);

      // Calculate minStopTime as startTime + 4 hours
      const minStopMilliseconds = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
      const futureStopTime = new Date(
        inputTime.getTime() + minStopMilliseconds,
      );

      const year = futureStopTime.getFullYear();
      const month = String(futureStopTime.getMonth() + 1).padStart(2, "0");
      const day = String(futureStopTime.getDate()).padStart(2, "0");
      const hours = String(futureStopTime.getHours()).padStart(2, "0");
      const minutes = String(futureStopTime.getMinutes()).padStart(2, "0");

      const formattedFutureStopTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      setMinEndTime(formattedFutureStopTime);
    }
  };

  // Handle Stop Time Change after start time is chosen
  const handleStopTimeChange = (e) => {
    const inputStopTime = new Date(e.target.value);
    const inputStartTime = new Date(worktime);

    // Ensure stop time is at least 4 hours after the start time
    if (inputStartTime && inputStopTime - inputStartTime < 4 * 60 * 60 * 1000) {
      setError("Job duration must be at least 4 hours.");
      setEndtime("");
    } else {
      setError("");
      setDisplayEnd(e.target.value);
      // Get the user's timezone offset in minutes
      const timezoneOffset = -inputStopTime.getTimezoneOffset(); // Offset in minutes
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
        .toString()
        .padStart(2, "0");
      const offsetMinutes = (Math.abs(timezoneOffset) % 60)
        .toString()
        .padStart(2, "0");

      const timezone = `UTC${
        timezoneOffset >= 0 ? "+" : "-"
      }${offsetHours}:${offsetMinutes}`;

      // Append the timezone offset to the worktime
      const formattedWorktime = `${e.target.value}`;

      setEndtime(formattedWorktime);
    }
  };

  async function handleFormSubmit(event) {
    event.preventDefault();
    const data = {
      jobtitle,
      description,
      dollarsperhr: dollarsPerHr,
      worktime,
      endtime,
    };

    // Sanitize each input
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
      const logData = {
        userId,
        action: "Malicious Activity Detected",
        description: `DomPurify removed malicious code from one or more of the create new jobs field udpate in the restauranteurs account data dashboard. ${message}`,
        userType: "employer",
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

        setJobtitle("");
        setDescription("");
        setDollarsPerHr("");

        const response2 = await fetch(
          `${process.env.REACT_APP_API_URL}/employer/inc-malact-count`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response2.ok) {
          throw new Error("Network response is not ok!");
        }
      } catch (e) {
        console.error("error:", e);
      }
      return; // Stop form submission
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        throw new Error("Network response is not ok!");
      }

      const result = await response.json();
    } catch (e) {
      console.error("error:", e);
    }
    setJobtitle("busser");
    setDescription(
      "Responsible for cleaning tables and maintaining dining area.",
    );
    setDollarsPerHr("");
    setWorktime("");
    setEndtime("");
    setMinWorkTime("");
    setMinEndTime("");
    setDisplayStart("");
    setDisplayEnd("");
    setResponse("You have created a new job.");
    setSelectedTitle("busser");
  }

  const handleTitleChange = (e) => {
    setSelectedTitle(e.target.value);
    setJobtitle(e.target.value);
    setDescription(jobOptions[e.target.value]);
  };

  return (
    <div>
      <h1>Create a Job!</h1>
      <div className="back-button-area">
        <DashboardBack onDisplaySet={onDisplaySet} screen={7}>
          ◀
        </DashboardBack>
      </div>
      <div className="loginform-container">
        <form className="loginform">
          <div>
            <p style={{ fontSize: "2rem", color: "red" }}>
              Job must start at least 24 hours from now.
            </p>
            <p style={{ fontSize: "2rem", color: "red" }}>
              Job length must be at least 4 hours.
            </p>
          </div>

          <label className="block mb-2 font-medium text-gray-700">
            Job Title
          </label>
          <select
            value={selectedTitle}
            onChange={handleTitleChange}
            style={{ height: "5vh" }}
          >
            {Object.keys(jobOptions).map((title) => (
              <option key={title} value={title}>
                {title.charAt(0).toUpperCase() + title.slice(1)}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-medium text-gray-700">
            Description
          </label>
          <textarea value={jobOptions[selectedTitle]} readOnly rows={4} />
          <label>
            How much will you pay them per hour?
            <input
              type="number"
              name="dollarsperhr"
              placeholder="ex: $15"
              value={dollarsPerHr}
              onChange={(e) => setDollarsPerHr(e.target.value)}
              maxLength={3}
            />
            {validateWage(dollarsPerHr) === false && (
              <p>Please enter a valid dollar amount.</p>
            )}
          </label>
          <div className="datetime-input-container">
            <label>
              Work Start-time:
              <input
                type="datetime-local"
                name="starttime"
                id="starttime"
                className="datetime-input"
                placeholder="Work Start-time"
                value={displayStart}
                onChange={handleStartTimeChange}
                min={minWorkTime}
              />
            </label>
            <label>
              Work End-time:
              <input
                type="datetime-local"
                name="endtime"
                id="endtime"
                className="datetime-input"
                placeholder="Work End-time"
                value={displayEnd}
                onChange={handleStopTimeChange}
                min={minEndTime}
                disabled={!worktime}
              />
            </label>
            {validateTimes(worktime, endtime) === false && (
              <p>
                Please make sure the work <b>start time</b> is <b>before</b> the
                work <b>end time.</b>
              </p>
            )}
          </div>
          {validateTimes(worktime, endtime) === true &&
            validateJobTitle(jobtitle) === true &&
            validateDescription(description) === true &&
            validateWage(dollarsPerHr) === true && (
              <input type="submit" name="submit" onClick={handleFormSubmit} />
            )}
          {response && (
            <p style={{ fontSize: "1.5rem", color: "red" }}>{response}</p>
          )}
          <div id="error-message"></div>
        </form>
      </div>
    </div>
  );
}
