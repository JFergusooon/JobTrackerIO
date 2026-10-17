import React, { useState } from 'react';
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

const RANGE_OPTIONS = [3, 6, 12];

const ModernStatsChart = ({allJobs}) => {
    const [rangeMonths, setRangeMonths] = useState(6);

    function countJobsByMonth(jobs) {
        const result = {};

        jobs.forEach(job => {
            if (!job.dateApplied) return;

            const date = new Date(job.dateApplied);
            const year = date.getFullYear();
            const month = date.getMonth();
            const key = `${year}-${month}`;

            result[key] = (result[key] || 0) + 1;
        });

        return result;
    }

    const jobsByMonth = countJobsByMonth(allJobs);
    const now = new Date();
    const months = Array.from({ length: rangeMonths }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (rangeMonths - 1 - i), 1);

        return {
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: d.toLocaleString('default', { month: 'short' })
        };
    });

    const filteredData = months.map(({ key, label }) => ({
        month: label,
        jobs: jobsByMonth[key] || 0
    }));

    return (
        <div className='modernStatsChartContainer'>
            <p className='modernStatsChartTitle'> Jobs Applied Over Last {rangeMonths} Months </p>

            <div className='modernStatsChartPlot'>
                <ResponsiveContainer width="95%" height="100%">
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" interval={0} tick={{ fontSize: rangeMonths === 12 ? 11 : 12 }} />
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

            <div className='modernStatsRangeButtons'>
                {RANGE_OPTIONS.map((monthsOption) => (
                    <button
                        key={monthsOption}
                        type="button"
                        className={monthsOption === rangeMonths ? 'modernStatsRangeButton modernStatsRangeButtonActive' : 'modernStatsRangeButton'}
                        onClick={() => setRangeMonths(monthsOption)}
                    >
                        {monthsOption}mo
                    </button>
                ))}
            </div>
        </div>
    );
};
export default ModernStatsChart;