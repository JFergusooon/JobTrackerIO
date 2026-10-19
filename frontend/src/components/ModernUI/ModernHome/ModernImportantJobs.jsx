import React, {useEffect, useLayoutEffect, useState, useRef} from 'react';
import '../../../css/Modern_HomePageCSS.css';
import '../../../css/Modern_TrackerPageCSS.css';
import { FaStar } from "react-icons/fa";
import { playSuccessDing, prepareSuccessDing } from '../../../successDing';

const FitSingleLine = ({ text, maxFontSize = 20, minFontSize = 12, style }) => {
    const ref = useRef(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    useLayoutEffect(() => {
        const element = ref.current;
        const parent = element?.parentElement;
        if (!element || !parent) return undefined;

        let frame = 0;
        const fit = () => {
            const node = ref.current;
            if (!node || node.clientWidth === 0) return;

            const available = node.clientWidth;
            let size = maxFontSize;
            node.style.fontSize = `${size}px`;
            while (size > minFontSize && node.scrollWidth > available + 1) {
                size -= 0.5;
                node.style.fontSize = `${size}px`;
            }
            setFontSize((current) => (current === size ? current : size));
        };

        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(fit);
        };

        schedule();
        const observer = new ResizeObserver(schedule);
        observer.observe(parent);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [text, maxFontSize, minFontSize]);

    return (
        <p
            ref={ref}
            style={{
                margin: 0,
                width: '100%',
                minWidth: 0,
                textAlign: 'left',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ...style,
                fontSize,
            }}
        >
            {text}
        </p>
    );
};

const userTimeZoneLabel = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName')?.value || '';

const parseInterviewDateTime = (value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed || trimmed === '00/00/0000') {
        return { date: '', time: '' };
    }

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
    if (isoMatch) {
        return {
            date: `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`,
            time: isoMatch[4] ? `${isoMatch[4]}:${isoMatch[5]}` : '',
        };
    }

    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{1,2}):(\d{2}))?/);
    if (slashMatch) {
        return {
            date: `${slashMatch[3]}-${slashMatch[1].padStart(2, '0')}-${slashMatch[2].padStart(2, '0')}`,
            time: slashMatch[4] ? `${slashMatch[4].padStart(2, '0')}:${slashMatch[5]}` : '',
        };
    }

    return { date: '', time: '' };
};

const formatInterviewDateLabel = (value) => {
    const { date } = parseInterviewDateTime(value);
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year.slice(-2)}`;
};

const formatInterviewTimeLabel = (value) => {
    const { time } = parseInterviewDateTime(value);
    if (!time) return '';

    const [hourString, minute] = time.split(':');
    let hour = Number(hourString);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const zone = userTimeZoneLabel ? ` ${userTimeZoneLabel}` : '';
    return `${hour}:${minute} ${suffix}${zone}`;
};

const ModernImportantJobs = ({importantJobsList, importantJobsLoading = false, onFavoriteChanged, onStageChanged}) => {
    const [favoritedJobs, setFavoritedJobs] = useState([]);
    const [editedNotes, setEditedNotes] = useState({});
    const timerRef = useRef({});

    const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
    const normalizeCompanyKey = (name) => (name ?? '').trim().toLowerCase();

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
                location: job.location ?? "",
                notes: job.notes ?? "",
                favorited: true,
                favorite: true,
            };
        });

        setFavoritedJobs(nextFavoritedJobs);
    }, [importantJobsList]);

    const updateInterviewDateTime = async (jobInfo, nextDate, nextTime) => {
        const username = localStorage.getItem('username') || 'JFergusooon';
        const companyName = jobInfo.companyName ?? jobInfo.company;
        const companyKey = normalizeCompanyKey(companyName);

        if (!companyName || !nextDate) {
            return;
        }
        prepareSuccessDing();

        const [year, month, day] = nextDate.split('-');
        const isClear = month === '00' && day === '00' && year === '0000';
        const [hour, minute] = !isClear && nextTime ? nextTime.split(':') : [];
        const params = new URLSearchParams({
            username,
            companyName,
            nextInterviewDateMonth: month,
            nextInterviewDateDay: day,
            nextInterviewDateYear: year,
        });
        if (hour && minute) {
            params.set('nextInterviewDateHour', hour);
            params.set('nextInterviewDateMinute', minute);
        }

        const storedValue = isClear
            ? '00/00/0000'
            : hour && minute
                ? `${month}/${day}/${year} ${hour}:${minute}`
                : `${month}/${day}/${year}`;
        const previousValue = jobInfo.interviewDate ?? jobInfo.nextInterviewDate ?? '';

        const applyStoredDate = (value) => {
            setFavoritedJobs((prev) =>
                prev.map((job) =>
                    normalizeCompanyKey(job.companyName ?? job.company) === companyKey
                        ? { ...job, interviewDate: value, nextInterviewDate: value }
                        : job
                )
            );
        };

        if (isClear) {
            applyStoredDate(storedValue);
        }

        try {
            const res = await fetch(`${stage}/Jobs/updateNextInterviewDate?${params.toString()}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                throw new Error(`Failed with status ${res.status}`);
            }

            applyStoredDate(storedValue);

            playSuccessDing();
        } catch (err) {
            if (isClear) {
                applyStoredDate(previousValue);
            }
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
        prepareSuccessDing();

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
            playSuccessDing();
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
        prepareSuccessDing();

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
            playSuccessDing();
        } catch (err) {
            console.error("Failed to update notes:", err);
        }
    };

    const handleNotesChange = (jobInfo, newNotes) => {
        prepareSuccessDing();
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


        const interviewParts = parseInterviewDateTime(jobInfo.interviewDate);
        const locationLabel = String(jobInfo.location ?? '').trim();
        const rawJobLink = String(jobInfo.jobLink ?? '').trim();
        const jobLink = rawJobLink && !/^n\/?a$/i.test(rawJobLink) ? rawJobLink : '';
        const jobLinkHref = jobLink
            ? (/^https?:\/\//i.test(jobLink) ? jobLink : `https://${jobLink}`)
            : '';

        return (
        <div key={`${jobInfo.company}-${index}`} className='modernImportantJobCard' style={{ background: 'rgba(255, 255, 255, 0.4)', border: '1px solid black', borderRadius: '20px', marginLeft: '5px', marginRight: '5px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minWidth: 0, flexShrink: 1, minHeight: 0}}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', margin: '4px 5px', width: '100%', minWidth: 0 }}>
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'baseline', minWidth: 0, width: '100%'}}>
                            <FaStar
                                onClick={() => toggleFavorite(jobInfo, index)}
                                style={{ color: (jobInfo.favorited ?? jobInfo.favorite) ? "orange" : "gray", marginTop: '4px', marginLeft: '8px', cursor: 'pointer', paddingRight: '8px', flexShrink: 0 }}
                                title={(jobInfo.favorited ?? jobInfo.favorite) ? 'Unfavorite' : 'Favorite'}
                            />
                            <p style={{margin: '0px', fontSize: '28px', flex: '0 1 auto', minWidth: 0, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{jobInfo.company}</p>
                            {locationLabel ? (
                                <p style={{margin: '0 0 0 8px', fontSize: '14px', color: '#444', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>- {locationLabel}</p>
                            ) : null}
                        </div>
                        <FitSingleLine
                            text={jobInfo.position}
                            maxFontSize={20}
                            minFontSize={12}
                            style={{ paddingLeft: '33px' }}
                        />
                    </div>
                    {/*<div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>*/}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '2px', margin: '2px 0', textAlign: 'right', flexShrink: 1, minWidth: 0}}>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap'}}>
                                    <p style={{margin: '0px', fontSize: '15px', whiteSpace: 'nowrap'}}>Interview Date:</p>
                                    <input
                                        type="datetime-local"
                                        className="modernInterviewDateTimeInput"
                                        value={interviewParts.date ? `${interviewParts.date}T${interviewParts.time || '00:00'}` : ''}
                                        title={userTimeZoneLabel ? `Date and time in ${userTimeZoneLabel}` : 'Local date and time'}
                                        onChange={(e) => {
                                            const nextValue = e.target.value;
                                            if (!nextValue) {
                                                updateInterviewDateTime(jobInfo, '0000-00-00', '');
                                                return;
                                            }
                                            const [nextDate, nextTime = ''] = nextValue.split('T');
                                            updateInterviewDateTime(jobInfo, nextDate, nextTime.slice(0, 5));
                                        }}
                                    />
                                    <p style={{margin: '0px', fontSize: '13px', whiteSpace: 'nowrap'}}>{formatInterviewDateLabel(jobInfo.interviewDate)}</p>
                                    {formatInterviewTimeLabel(jobInfo.interviewDate) ? (
                                        <p style={{margin: '0px', fontSize: '13px', whiteSpace: 'nowrap'}}>{formatInterviewTimeLabel(jobInfo.interviewDate)}</p>
                                    ) : null}
                                </div>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '3px', margin: '5px', paddingRight: '6px', boxSizing: 'border-box', width: '100%', justifyContent: 'right'}}>
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
            <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '2px', paddingBottom: '4px' }}>
                <div style={{ width: '10%', margin: '0 5px 0 5px', alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', height: '100%' }}>
                        <p style={{ margin: 0, paddingTop: '2px', color: 'gray', whiteSpace: 'nowrap' }}>Notes:</p>
                        {jobLinkHref ? (
                            <a href={jobLinkHref} target="_blank" rel="noreferrer" style={{ position: 'absolute', left: 0, bottom: '10px', color: '#1a4fbf', fontSize: '13px', whiteSpace: 'nowrap' }}>Job Link</a>
                        ) : null}
                    </div>
                </div>
                <textarea value={currentNotes} onChange={(e) => handleNotesChange(jobInfo, e.target.value)} style={{height: 'calc(100% - 10px)', width: '95%', borderRadius: '20px', marginRight: '5px', resize: 'none', padding: '4px 8px', boxSizing: 'border-box', verticalAlign: 'top', textAlign: 'left', overflow: 'auto', border: '1px solid var(--nav-background)'}} placeholder="Add notes..." />
            </div>
        </div>
    )};



    return (
        <div className='modernImportantJobsContainer'>
            <p className='modernImportantJobsTitle'> Important Interviews </p>
            <div className='modernImportantJobsScroll'>
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
export default ModernImportantJobs;