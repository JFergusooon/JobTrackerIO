import React, {useEffect, useState, useRef} from 'react';
import '../../../css/Modern_HomePageCSS.css';
import '../../../css/Modern_TrackerPageCSS.css';
import { FaStar } from "react-icons/fa";

const Modern_ImportantJobs = ({importantJobsList, importantJobsLoading = false, onFavoriteChanged, onStageChanged}) => {
    const [favoritedJobs, setFavoritedJobs] = useState([]);
    const [editedNotes, setEditedNotes] = useState({});
    const timerRef = useRef({});

    const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
    const normalizeCompanyKey = (name) => (name ?? '').trim().toLowerCase();

    // Format date from YYYY-MM-DD to MM/DD/YYYY for display
    const formatDateForDisplay = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return "";
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        if (!year || !month || !day) return "";
        return `${month}/${day}/${year}`;
    };

    // Map numeric stage values to display names
    const STAGE_VALUE_MAP = {
        "0": "applied",
        "0.5": "initial",
        "1": "stage1",
        "2": "stage2",
        "3": "stage3",
        "4": "awaitingOffer"
    };

    // Reverse map for looking up current value
    const REVERSE_STAGE_MAP = {
        "applied": "0",
        "initial": "0.5",
        "stage1": "1",
        "stage2": "2",
        "stage3": "3",
        "awaitingOffer": "4"
    };

    useEffect(() => {
        if (!Array.isArray(importantJobsList)) {
            setFavoritedJobs([]);
            return;
        }

        const nextFavoritedJobs = importantJobsList
            .filter((job) => (job?.favorited ?? job?.favorite ?? false) === true)
            .map((job) => {
            const companyName = job.companyName ?? job.company ?? "Unknown Company";
            return {
                ...job,
                company: job.company ?? job.companyName ?? "Unknown Company",
                companyName,
                position: Array.isArray(job.position) ? job.position.join(', ') : (job.position ?? "Unknown Position"),
                interviewDate: job.nextInterviewDate ?? "",
                notes: job.notes ?? "",
                favorited: true,
                favorite: true,
            };
        });

        setFavoritedJobs(nextFavoritedJobs);
    }, [importantJobsList]);

    const updateDate = async (jobInfo, newDate) => {
        const username = localStorage.getItem('username') || 'JFergusooon';
        const companyName = jobInfo.companyName ?? jobInfo.company;
        const companyKey = normalizeCompanyKey(companyName);

        if (!companyName || !newDate) {
            return;
        }

        // Parse date (format: YYYY-MM-DD)
        const [year, month, day] = newDate.split('-');

        const url = `${stage}/Jobs/updateNextInterviewDate?username=${encodeURIComponent(username)}&companyName=${encodeURIComponent(companyName)}&nextInterviewDateMonth=${month}&nextInterviewDateDay=${day}&nextInterviewDateYear=${year}`;

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`Failed with status ${res.status}`);
            }

            // Update local state with new date
            setFavoritedJobs((prev) =>
                prev.map((job) =>
                    normalizeCompanyKey(job.companyName ?? job.company) === companyKey
                        ? { ...job, interviewDate: newDate }
                        : job
                )
            );

            console.log(`Updated ${companyName} interview date to ${newDate}`);
        } catch (err) {
            console.error("Failed to update interview date:", err);
        }
    };

    const handleStateChange = async (jobInfo, newStageName) => {
        const username = localStorage.getItem('username') || 'JFergusooon';
        const companyName = jobInfo.companyName ?? jobInfo.company;
        const companyKey = normalizeCompanyKey(companyName);

        if (!companyName) {
            return;
        }

        const url = `${stage}/Jobs/updateState?username=${encodeURIComponent(username)}&companyName=${encodeURIComponent(companyName)}&value=${encodeURIComponent(newStageName)}`;

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`Failed with status ${res.status}`);
            }

            // Update local state with new stage
            setFavoritedJobs((prev) =>
                prev.map((job) =>
                    normalizeCompanyKey(job.companyName ?? job.company) === companyKey
                        ? { ...job, stage: REVERSE_STAGE_MAP[newStageName] }
                        : job
                )
            );

            // Notify parent to update allJobs
            if (typeof onStageChanged === 'function') {
                onStageChanged(companyName, REVERSE_STAGE_MAP[newStageName]);
            }

            console.log(`Updated ${companyName} state to ${newStageName}`);
        } catch (err) {
            console.error("Failed to update job state:", err);
        }
    };

    const toggleFavorite = async (jobInfo, index) => {
        const username = localStorage.getItem('username') || 'JFergusooon';
        const companyName = jobInfo.companyName ?? jobInfo.company;
        const companyKey = normalizeCompanyKey(companyName);

        if (!companyName) {
            return;
        }

        const previousFavoritedJobs = [...favoritedJobs];
        setFavoritedJobs((prev) => prev.filter((job) => normalizeCompanyKey(job.companyName ?? job.company) !== companyKey));

        if (typeof onFavoriteChanged === 'function') {
            onFavoriteChanged(companyName, false);
        }

        const url = `${stage}/Jobs/updateFavorited?username=${encodeURIComponent(username)}&companyName=${encodeURIComponent(companyName)}`;

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`Failed with status ${res.status}`);
            }
        } catch (err) {
            console.error("Failed to update favorited status:", err);
            setFavoritedJobs(previousFavoritedJobs);
            if (typeof onFavoriteChanged === 'function') {
                onFavoriteChanged(companyName, true);
            }
        }
    };

    const updateNotes = async (companyName, newNotes) => {
        const username = localStorage.getItem('username') || 'JFergusooon';
        const companyKey = normalizeCompanyKey(companyName);

        if (!companyName) {
            return;
        }

        const url = `${stage}/Jobs/updateNotes?username=${encodeURIComponent(username)}&companyName=${encodeURIComponent(companyName)}&newNotes=${encodeURIComponent(newNotes)}`;

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`Failed with status ${res.status}`);
            }

            // Update local state with new notes
            setFavoritedJobs((prev) =>
                prev.map((job) =>
                    normalizeCompanyKey(job.companyName ?? job.company) === companyKey
                        ? { ...job, notes: newNotes }
                        : job
                )
            );

            console.log(`Updated ${companyName} notes`);
        } catch (err) {
            console.error("Failed to update notes:", err);
        }
    };

    const handleNotesChange = (jobInfo, newNotes) => {
        const companyName = jobInfo.companyName ?? jobInfo.company;
        const companyKey = normalizeCompanyKey(companyName);

        // Update the edited notes state
        setEditedNotes((prev) => ({
            ...prev,
            [companyKey]: newNotes
        }));

        // Clear existing timer for this job
        if (timerRef.current[companyKey]) {
            clearTimeout(timerRef.current[companyKey]);
        }

        // Set new timer to call API after 4 seconds of no typing
        timerRef.current[companyKey] = setTimeout(() => {
            updateNotes(companyName, newNotes);
            delete timerRef.current[companyKey];
        }, 4000);
    };


    const buildImportantJobBox = (jobInfo, index) => {
        const companyKey = normalizeCompanyKey(jobInfo.companyName ?? jobInfo.company);
        const currentNotes = editedNotes[companyKey] !== undefined ? editedNotes[companyKey] : jobInfo.notes;


        return (
        <div key={`${jobInfo.company}-${index}`} style={{ height: '150px', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid black', borderRadius: '20px', margin: '3px 5px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', height: '70px', width: '100%'}}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '100px', margin: '5px', width: '100%' }}>
                    <div style={{ minWidth: 0, width: '100%' }}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <FaStar
                                onClick={() => toggleFavorite(jobInfo, index)}
                                style={{ color: (jobInfo.favorited ?? jobInfo.favorite) ? "orange" : "gray", marginTop: '10px', marginLeft: '10px', cursor: 'pointer', paddingRight: '10px' }}
                                title={(jobInfo.favorited ?? jobInfo.favorite) ? 'Unfavorite' : 'Favorite'}
                            />
                            <p style={{margin: '0px', fontSize: '28px', width: '100%', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{jobInfo.company}</p>
                            
                        </div>
                        <p style={{margin: '0px', fontSize: '20px', textAlign: 'left', paddingLeft: '32px'}}>{jobInfo.position}</p>
                    </div>
                    {/*<div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>*/}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px', textAlign: 'right'}}>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '3px', textAlign: 'right'}}>
                                <p style={{margin: '0px', fontSize: '15px', textAlign: 'right'}}> Interview Date: {formatDateForDisplay(jobInfo.interviewDate)} </p>
                                <input type="date" value={jobInfo.interviewDate || ""} onChange={(e) => updateDate(jobInfo, e.target.value)}
                                        style={{ width: '18px', height: '20px', padding: 0, border: 'none', color: 'transparent', cursor: 'pointer'}}/>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '3px', margin: '5px', width: '100%', justifyContent: 'right'}}>
                                <p style={{margin: '0px', fontSize: '15px'}}>Stage:</p>
                                <select 
                                    value={STAGE_VALUE_MAP[String(jobInfo.stage)] || "applied"}
                                    onChange={(e) => handleStateChange(jobInfo, e.target.value)}
                                >
                                    <option value="applied">Applied</option>
                                    <option value="initial">Initial Recruiter Call</option>
                                    <option value="stage1">Stage 1 Interview</option>
                                    <option value="stage2">Stage 2 Interview</option>
                                    <option value="stage3">Stage 3 Interview</option>
                                    <option value="awaitingOffer">Awaiting Offer</option>
                                </select>
                            </div>
                        </div>
                    {/*</div>*/}
                </div>
            </div>
            <div style={{ height: '90px', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px' }}>
                <p style={{width: '10%', margin: '0 5px 0 5px', textAlign: 'right', paddingTop: '2px', color: 'gray'}}>Notes: </p>
                <textarea value={currentNotes} onChange={(e) => handleNotesChange(jobInfo, e.target.value)} style={{height: '90%', width: '95%', borderRadius: '20px', marginRight: '5px', resize: 'none', padding: '4px 8px', boxSizing: 'border-box', verticalAlign: 'top', textAlign: 'left', overflow: 'auto', border: '1px solid var(--nav-background)'}} placeholder="Add notes..." />
            </div>
        </div>
    )};



    return (
        <div className='modernImportantJobsContainer'>
            <p className='modernImportantJobsTitle'> Important Interviews </p>
            <div className='modernImportantJobsScroll' style={{display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px'}}>
                {importantJobsLoading ? (
                    <div className='modernSearchLoadingContainer' style={{marginTop: '20px'}}>
                        <div className='modernListLoadingBadge'>
                            <span className='modernListLoadingSpinner'></span>
                            <span>Loading...</span>
                        </div>
                    </div>
                ) : favoritedJobs.length > 0 ? (
                    favoritedJobs.map((jobInfo, index) => buildImportantJobBox(jobInfo, index))
                ) : (
                    <p style={{textAlign: 'center', color: '#999', padding: '20px'}}>You have no favorited jobs. Favorite a job in the tracker page.</p>
                )}
            </div>
        </div>
    );
};
export default Modern_ImportantJobs;