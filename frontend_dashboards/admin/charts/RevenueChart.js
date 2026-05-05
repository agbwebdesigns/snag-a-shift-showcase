import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ token }) {
  const [revenue, setRevenue] = useState();

  const handleGetRevenueData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/analytics/revenue?timeFrame=monthly`,
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

      setRevenue(result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    handleGetRevenueData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={revenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalRevenue" fill="#8884d8" />
        <Bar dataKey="totalHoursWorked" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
