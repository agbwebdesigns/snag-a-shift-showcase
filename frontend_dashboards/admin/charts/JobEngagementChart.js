import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function JobEngagementChart({ token }) {
  const [engagedJobs, setEngagedJobs] = useState();

  const handleGetJobEngagementData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/analytics/jobs/engagement?timeFrame=monthly`,
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

      setEngagedJobs(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    handleGetJobEngagementData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={engagedJobs}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalApplications" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
