import React, {useEffect, useState} from 'react';
import '../../../css/Modern_HomePageCSS.css';

const ModernStatsInfo = ({allJobs}) => {
    const [totalAppliedThisMonth, setTotalAppliedThisMonth] = useState("---");
    const [totalRejectedThisMonth, setTotalRejectedThisMonth] = useState("---");
    const [totalJobsStageTwo, setTotalJobsStageTwo] = useState("---");
    const [totalJobsStageThree, setTotalJobsStageThree] = useState("---");
    const [totalApplicationsEver, setTotalApplicationsEver] = useState("---");
    const [totalInterviewsScheduled, setTotalInterviewsScheduled] = useState("---");
    const [pendingResponses, setPendingResponses] = useState("---");
    const [successRate, setSuccessRate] = useState("---");
    const [totalRejectionsEver, setTotalRejectionsEver] = useState("---");
    const [totalTimeLookingForJob, setTotalTimeLookingForJob] = useState("---");

    const getStageString = (stageValue) => String(stageValue ?? '').trim();

    useEffect(() => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const jobsThisMonth = (allJobs || []).filter((job) => {
                if (!job.dateApplied) return false;
                const appliedDate = new Date(job.dateApplied);
                return !Number.isNaN(appliedDate.getTime()) &&
                    appliedDate.getMonth() === currentMonth &&
                    appliedDate.getFullYear() === currentYear;
            });

            let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
            let url = stage_url + "/Jobs/getByMonth?username=" + localStorage.getItem('username') + "&month=05"
            let encode = window.btoa("admin:admin");
            fetch(url, {
                headers: {
                    'Authorization':  'Basic ' + encode
                }}    
            )
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log("getting all applications from this month: " + JSON.stringify(result));
                        
                        setTotalAppliedThisMonth(jobsThisMonth.length);
                        const rejectedThisMonth = jobsThisMonth.filter((job) => job.status === 'Rejected' || job.rejected === true).length;
                        setTotalRejectedThisMonth(rejectedThisMonth);
                        
                        const jobs = Array.isArray(allJobs) ? allJobs : [];
                        setTotalApplicationsEver(jobs.length);

                        const interviewsScheduled = jobs.filter((job) => {
                            const stage = getStageString(job.stage);
                            return stage === '1' || stage === '2' || stage === '3';
                        }).length;
                        setTotalInterviewsScheduled(interviewsScheduled);
                        
                        const rejected = jobs.filter(job => job.status === 'Rejected' || job.rejected === true).length;
                        const pending = jobs.length - rejected;
                        setPendingResponses(pending);
                        setTotalRejectionsEver(rejected);

                        const rate = jobs.length > 0 ? ((interviewsScheduled / jobs.length) * 100).toFixed(1) : 0;
                        setSuccessRate(rate);

                        const validAppliedDates = jobs
                            .map(job => new Date(job.dateApplied))
                            .filter(date => !Number.isNaN(date.getTime()));

                        if (validAppliedDates.length > 0) {
                            const firstApplicationDate = new Date(Math.min(...validAppliedDates.map(date => date.getTime())));
                            const latestApplicationDate = new Date(Math.max(...validAppliedDates.map(date => date.getTime())));
                            const firstDateOnlyMs = new Date(
                                firstApplicationDate.getFullYear(),
                                firstApplicationDate.getMonth(),
                                firstApplicationDate.getDate()
                            ).getTime();
                            const latestDateOnlyMs = new Date(
                                latestApplicationDate.getFullYear(),
                                latestApplicationDate.getMonth(),
                                latestApplicationDate.getDate()
                            ).getTime();
                            const dayDifference = Math.floor((latestDateOnlyMs - firstDateOnlyMs) / (1000 * 60 * 60 * 24));
                            setTotalTimeLookingForJob(`${dayDifference} Days`);
                        } else {
                            setTotalTimeLookingForJob("0 Days");
                        }

                        const stage2 = jobs.filter((job) => getStageString(job.stage) === '2').length;
                        const stage3 = jobs.filter((job) => getStageString(job.stage) === '3').length;
                        setTotalJobsStageTwo(stage2);
                        setTotalJobsStageThree(stage3);
                    },
                    (error) => {
                        console.error('Failed to load stats info:', error);
                    }
                )
        }, [allJobs])

    const stats = [
        { label: 'Total Applied This Month', value: totalAppliedThisMonth, color: '#4a9eff' },
        { label: 'Total Rejected This Month', value: totalRejectedThisMonth, color: '#ff6b6b' },
        { label: 'Jobs in Stage 2', value: totalJobsStageTwo, color: '#ffa500' },
        { label: 'Jobs in Stage 3', value: totalJobsStageThree, color: '#9DBF9E' },
        { label: 'Total Applications Ever', value: totalApplicationsEver, color: '#c9b6ff' },
        { label: 'Interviews Scheduled', value: totalInterviewsScheduled, color: '#5bc0de' },
        { label: 'Pending Responses', value: pendingResponses, color: '#f0ad4e' },
        { label: 'Interview Rate (%)', value: `${successRate}%`, color: '#5cb85c' },
        { label: 'Total Rejections Ever', value: totalRejectionsEver, color: '#d9534f' },
        { label: 'Total Time Looking For Job', value: totalTimeLookingForJob, color: '#333' },
    ];

    return (
        <div className='modernStatsInfoContainer'>
            <p className='modernStatsInfoTitle'> Stats </p>
            <div className='modernStatsInfoGrid'>
                {stats.map((stat) => (
                    <div className='modernStatsInfoItem' key={stat.label}>
                        <p className='modernStatsInfoLabel'>{stat.label}</p>
                        <p className='modernStatsInfoValue' style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ModernStatsInfo;