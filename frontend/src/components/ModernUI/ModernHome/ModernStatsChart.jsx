import React from 'react';
import '../../../css/Modern_HomePageCSS.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const ModernStatsChart = ({allJobs}) => {

    function countJobsByMonth(jobs) {
    const result = {};

    jobs.forEach(job => {
        if (!job.dateApplied) return;

        const date = new Date(job.dateApplied);

        const year = date.getFullYear();
        const month = date.getMonth(); // 0–11

        const key = `${year}-${month}`; // e.g. "2025-11"

        result[key] = (result[key] || 0) + 1;
    });

    return result;
}

    const jobsByMonth = countJobsByMonth(allJobs);


const now = new Date();

const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);

    return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('default', { month: 'short' }) // "Jan", etc.
    };
});


const filteredData = last6Months.map(({ key, label }) => ({
    month: label,
    jobs: jobsByMonth[key] || 0
}));

    return (
        <div className='modernStatsChartContainer'>
            <p className='modernStatsChartTitle'> Jobs Applied Over Last 6 Months </p>

            <div style={{
    width: "90%",
    height: 300,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}>
                <ResponsiveContainer width="95%" height="100%">
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="jobs"
                            stroke="#4f46e5"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default ModernStatsChart;