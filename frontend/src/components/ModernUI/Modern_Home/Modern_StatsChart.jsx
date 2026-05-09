import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
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

const Modern_StatsChart = ({allJobs, text, closePopup}) => {

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

    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const jobsByMonth = countJobsByMonth(allJobs);


    const data = monthOrder.map(month => ({
        month,
        jobs: jobsByMonth[month] || 0
    }));






const now = new Date();
const currentMonthIndex = now.getMonth();

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

//Split All Rejected Jobs By Month, ['Jan' of Current Year, 'Feb' of Current Year, ...]
    function countOfRejectedJobsByMonth(jobs) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();
        const rejectedJobsByMonth = {};
        monthNames.forEach(month => {
            rejectedJobsByMonth[month] = jobs.filter(job => {
                const jobDate = new Date(job.dateApplied);
                return job.status === "Rejected" && jobDate.getFullYear() === currentYear && jobDate.getMonth() === monthNames.indexOf(month);
            }).length;
        });
        return rejectedJobsByMonth;
    }

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
export default Modern_StatsChart;