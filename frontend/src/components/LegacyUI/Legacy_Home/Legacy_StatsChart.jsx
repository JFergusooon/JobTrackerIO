import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Legacy_HomePageCSS.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Legacy_StatsChart = ({text, closePopup}) => {

    const data = [
  { month: "Jan", jobs: 50 },
  { month: "Feb", jobs: 120 },
  { month: "Mar", jobs: 80 },
  { month: "Apr", jobs: 24 },
  { month: "May", jobs: 63 },
  { month: "Jun", jobs: 130 },
  { month: "Jul", jobs: 230 },
  { month: "Aug", jobs: 60 },
  { month: "Sep", jobs: 73 },
  { month: "Oct", jobs: 92 },
  { month: "Nov", jobs: 10 },
  { month: "Dec", jobs: 54 },
];

const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const now = new Date();
const currentMonthIndex = now.getMonth();

// get last 6 months safely (handles year wrap)
const last6Months = Array.from({ length: 6 }, (_, i) => {
  const index = (currentMonthIndex - (5 - i) + 12) % 12;
  return monthOrder[index];
});

// keep order aligned
const filteredData = last6Months.map(month => {
  const found = data.find(d => d.month === month);
  return found || { month, jobs: 0 };
});

    return (
        <div className='statsChartContainer'>
            <p className='statsChartTitle'> Jobs Applied Over Time </p>

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
export default Legacy_StatsChart;