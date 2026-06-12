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

    return (
        <div className='modernStatsInfoContainer'>
            <p style={{fontSize: '20px', marginTop: '5px', marginBottom: '15px', textAlign: 'center'}}> Stats </p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 14px 8px 14px', height: 'calc(100% - 44px)', alignContent: 'start'}}>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Total Applied This Month</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#4a9eff'}}>{totalAppliedThisMonth}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Total Rejected This Month</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#ff6b6b'}}>{totalRejectedThisMonth}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Jobs in Stage 2</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#ffa500'}}>{totalJobsStageTwo}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Jobs in Stage 3</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#9DBF9E'}}>{totalJobsStageThree}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Total Applications Ever</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#c9b6ff'}}>{totalApplicationsEver}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Interviews Scheduled</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#5bc0de'}}>{totalInterviewsScheduled}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Pending Responses</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#f0ad4e'}}>{pendingResponses}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Interview Rate (%)</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#5cb85c'}}>{successRate}%</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Total Rejections Ever</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#d9534f'}}>{totalRejectionsEver}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px'}}>
                    <p style={{margin: '0', fontSize: '13px', color: '#666'}}>Total Time Looking For Job</p>
                    <p style={{margin: '3px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#333'}}>{totalTimeLookingForJob}</p>
                </div>
            </div>
        </div>
    );
};
export default ModernStatsInfo;