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

export default function JobFillChart({ token }) {
  const [filledJobs, setFilledJobs] = useState();

  const handleGetJobFillData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/analytics/shifts-filled?timeFrame=monthly`,
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

      setFilledJobs(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    handleGetJobFillData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={filledJobs}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
