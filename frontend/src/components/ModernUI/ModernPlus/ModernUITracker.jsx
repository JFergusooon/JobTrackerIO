import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../../../css/Modern_TrackerPageCSS.css'
import ModernEditJobButtons from '../ModernTracker/ModernEditJobButtons.jsx';
import ModernNewListPopup from '../ModernTracker/ModernNewListPopup.jsx';
import ModernNewApplicationPopup from '../ModernTracker/ModernNewApplicationPopup.jsx'
import ModernListManagement from '../ModernTracker/ModernListManagement.jsx';
import ModernApplicationCount from '../ModernTracker/ModernApplicationCount.jsx';
import ModernDeletePopupV2 from '../ModernTracker/ModernDeletePopupv2.jsx';

function ModernUITracker() { 

    const [allJobs, setAllJobs] = useState([]);

    const [selectedCompanyName, setSelectedCompanyName] = useState("");
    const [companyItem, setCompanyItem] = useState();
    
    const [selectedFromSearch, setSelectedFromSearch] = useState();

    const [showEditJobButtons, setShowEditJobButtons] = useState(false);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [showNewApplicationPopup, setShowNewApplicationPopup] = useState(false);

    const [curJobsByListName, setCurJobsByListName] = useState([]);
    const waitingByList = curJobsByListName.filter(job => !job.rejected).length;
    const rejectByList = curJobsByListName.filter(job => job.rejected).length;

    const [selectedJob, setSelectedJob] = useState(null);

    const [curUserListNames, setCurUserListNames] = useState([]);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const curWaitingJobs = (Array.isArray(allJobs) ? allJobs : []).filter(job => !job.rejected).length;
    const curRejectedJobs = (Array.isArray(allJobs) ? allJobs : []).filter(job => job.rejected).length;

    const location = useLocation();
    const navigate = useNavigate();
    const listName = new URLSearchParams(location.search).get("listName");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [actionStatusMessage, setActionStatusMessage] = useState("");

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const hasValidCurrentList = Boolean(listName && curUserListNames.includes(listName));
    const isHeaderSortActive = ['companyName', 'position', 'location', 'jobLink', 'rejected', 'favorite'].includes(sortField);

    const fetchAllJobs = async () => {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Jobs/getByUsername?username=${localStorage.getItem("username")}`;
        const encode = window.btoa("admin:admin");

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': 'Basic ' + encode },
                method: "GET"
            });

            const data = await res.json();
            setAllJobs(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAllJobs();
    }, []);

    const fetchSearchResults = useCallback(async () => {
        setSearchLoading(true);

        try {
            const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
            const url = `${stage}/Jobs/getByUsername?username=${localStorage.getItem("username")}`;

            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                const filtered = data.filter(job =>
                    job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setSearchResults(filtered);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error(err);
            setSearchResults([]);
        }

        setSearchLoading(false);
    }, [searchTerm]);

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetchSearchResults();
        }, 300); // debounce

        return () => clearTimeout(timeout);
    }, [searchTerm, fetchSearchResults]);

    const getDisplayPosition = (position) => {
        if (position === "SE") {
            return "Software Engineer";
        }
        return position;
    };

    const getFavoriteValue = (job) => (job.favorite ?? job.favorited ?? false);

    const handleRejectedToggled = (companyName, isRejected) => {
        setCurJobsByListName((prevJobs) =>
            Array.isArray(prevJobs) ? prevJobs.map((job) =>
                job.companyName === companyName ? { ...job, rejected: isRejected } : job
            ) : prevJobs
        );

        setAllJobs((prevJobs) =>
            Array.isArray(prevJobs) ? prevJobs.map((job) =>
                job.companyName === companyName ? { ...job, rejected: isRejected } : job
            ) : prevJobs
        );

        setSearchResults((prevResults) =>
            Array.isArray(prevResults) ? prevResults.map((job) =>
                job.companyName === companyName ? { ...job, rejected: isRejected } : job
            ) : prevResults
        );

        setSelectedJob((prevJob) =>
            prevJob && prevJob.companyName === companyName
                ? { ...prevJob, rejected: isRejected }
                : prevJob
        );

        setCompanyItem((prevJob) =>
            prevJob && prevJob.companyName === companyName
                ? { ...prevJob, rejected: isRejected }
                : prevJob
        );

        setActionStatusMessage(
            `${companyName}: ${isRejected ? "set to rejected" : "set to not rejected"}`
        );
    };

    const handleFavoriteToggled = async (companyName, currentFavoriteValue) => {
        const nextFavorited = !currentFavoriteValue;
        const username = localStorage.getItem('username') || 'JFergusooon';
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Jobs/updateFavorited?username=${encodeURIComponent(username)}&companyName=${encodeURIComponent(companyName)}`;

        const applyFavoriteState = (favoritedValue) => {
            setCurJobsByListName((prevJobs) =>
                Array.isArray(prevJobs) ? prevJobs.map((job) =>
                    job.companyName === companyName
                        ? { ...job, favorite: favoritedValue, favorited: favoritedValue }
                        : job
                ) : prevJobs
            );

            setAllJobs((prevJobs) =>
                Array.isArray(prevJobs) ? prevJobs.map((job) =>
                    job.companyName === companyName
                        ? { ...job, favorite: favoritedValue, favorited: favoritedValue }
                        : job
                ) : prevJobs
            );

            setSearchResults((prevResults) =>
                Array.isArray(prevResults) ? prevResults.map((job) =>
                    job.companyName === companyName
                        ? { ...job, favorite: favoritedValue, favorited: favoritedValue }
                        : job
                ) : prevResults
            );

            setSelectedJob((prevJob) =>
                prevJob && prevJob.companyName === companyName
                    ? { ...prevJob, favorite: favoritedValue, favorited: favoritedValue }
                    : prevJob
            );

            setCompanyItem((prevJob) =>
                prevJob && prevJob.companyName === companyName
                    ? { ...prevJob, favorite: favoritedValue, favorited: favoritedValue }
                    : prevJob
            );
        };

        applyFavoriteState(nextFavorited);
        setActionStatusMessage(`${companyName}: ${nextFavorited ? "set to favorited" : "set to not favorited"}`);

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
            applyFavoriteState(currentFavoriteValue);
            setActionStatusMessage(`${companyName}: failed to update favorited status`);
        }
    };

    const handleSortChange = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleResetSort = () => {
        setSortField(null);
        setSortDirection("asc");
    };

    const getSortedJobs = () => {
        const jobsCopy = [...curJobsByListName];

        if (!sortField) {
            return jobsCopy;
        }
        
        jobsCopy.sort((a, b) => {
            let aVal, bVal;

            switch (sortField) {
                case "dateApplied":
                    aVal = a.dateApplied ? new Date(a.dateApplied).getTime() : 0;
                    bVal = b.dateApplied ? new Date(b.dateApplied).getTime() : 0;
                    break;
                case "companyName":
                    aVal = a.companyName.toLowerCase();
                    bVal = b.companyName.toLowerCase();
                    break;
                case "position":
                    aVal = a.position.toLowerCase();
                    bVal = b.position.toLowerCase();
                    break;
                case "location":
                    // Extract state and city from location (assume format: "City, ST")
                    const parseLocation = (loc) => {
                        const locLower = loc.toLowerCase();
                        if (locLower === "n/a") {
                            return { type: 'na', state: '', city: '' };
                        }
                        if (locLower === "remote") {
                            return { type: 'remote', state: '', city: '' };
                        }
                        const parts = loc.split(',').map(p => p.trim());
                        const state = parts.length > 1 ? parts[1].toLowerCase() : '';
                        const city = parts.length > 0 ? parts[0].toLowerCase() : '';
                        return { type: 'location', state, city };
                    };

                    const aLoc = parseLocation(a.location);
                    const bLoc = parseLocation(b.location);

                    // Fixed order: locations → remote → N/A (regardless of sort direction)
                    const typeOrder = { location: 0, remote: 1, na: 2 };
                    if (typeOrder[aLoc.type] !== typeOrder[bLoc.type]) {
                        return typeOrder[aLoc.type] - typeOrder[bLoc.type];
                    }

                    // Within same type, sort by state first, then city
                    if (aLoc.type === 'location') {
                        if (aLoc.state !== bLoc.state) {
                            aVal = aLoc.state;
                            bVal = bLoc.state;
                        } else {
                            aVal = aLoc.city;
                            bVal = bLoc.city;
                        }
                    } else {
                        // For remote and N/A, no secondary sorting needed
                        return 0;
                    }
                    break;
                case "jobLink":
                    aVal = a.jobLink.toLowerCase();
                    bVal = b.jobLink.toLowerCase();
                    break;
                case "rejected":
                    aVal = a.rejected ? 1 : 0;
                    bVal = b.rejected ? 1 : 0;
                    break;
                case "favorite":
                    aVal = getFavoriteValue(a) ? 1 : 0;
                    bVal = getFavoriteValue(b) ? 1 : 0;
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return jobsCopy;
    };


    useEffect(() => {
        if (!listName) return;

        let isCurrentRequest = true;
        let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        let url = `${stage_url}/Jobs/getByListName?username=${localStorage.getItem('username')}&listName=${listName}`;
        let encode = window.btoa("admin:admin");

        setListLoading(true);
        setCurJobsByListName([]);

        fetch(url, {
            headers: { 'Authorization': 'Basic ' + encode },
            method: "GET"
        })
        .then(res => res.json())
        .then((result) => {
            if (!isCurrentRequest) return;
            setCurJobsByListName(Array.isArray(result) ? result : []);
        })
        .catch((error) => {
            if (!isCurrentRequest) return;
            console.error('Failed to fetch jobs by list:', error);
            setCurJobsByListName([]);
        })
        .finally(() => {
            if (!isCurrentRequest) return;
            setListLoading(false);
        });

        return () => {
            isCurrentRequest = false;
        };
    }, [listName]);

    useEffect(() => {
                    let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
                    let url = stage_url + "/Users/getByUsername?username=" + localStorage.getItem('username')
                    let encode = window.btoa("admin:admin");
                    fetch(url, {
                        headers: {
                            'Authorization':  'Basic ' + encode
                        }}    
                    )
                        .then(res => res.json())
                        .then(
                            (result) => {
                                const sourceUser = result?.body || result;
                                setCurUserListNames(Array.isArray(sourceUser?.listNames) ? sourceUser.listNames : []);
                            },
                            (error) => {
                                console.error('Failed to fetch user list names:', error);
                            }
                        )
                }, [])

    // Auto-navigate to random list when tracker is opened without a listName
    useEffect(() => {
        if (curUserListNames.length > 0 && !listName) {
            const randomIndex = Math.floor(Math.random() * curUserListNames.length);
            const randomList = curUserListNames[randomIndex];
            navigate(`?listName=${encodeURIComponent(randomList)}`);
        }
    }, [curUserListNames, listName, navigate]);

    const toggleNewListPopup = () => {
        setShowNewListPopup(!showNewListPopup);
    }

    const toggleNewApplicationPopup = () => {
        setSelectedCompanyName("");
        setShowNewApplicationPopup(!showNewApplicationPopup);
    }

    const toggleDeletePopup = () => {
        if (!hasValidCurrentList) {
            return;
        }
        setShowDeletePopup(!showDeletePopup);
    }

    
    useEffect(() => {
        if (!actionStatusMessage) return;

        const timer = setTimeout(() => {
            setActionStatusMessage("");
        }, 2500);

        return () => clearTimeout(timer);
    }, [actionStatusMessage]);

    const rightColumnGridTemplate = '1.5fr 1.5fr 1.5fr 6.5rem 5.5rem 6.25rem';

    return (<>
        <div style={{width: '100%', height: '100%', overflow: 'hidden', minHeight: 0}}>
            <div className='modernTrackerContainer'>
                {/*Left Column*/}
                <div className='modernLeftColumn'>
            
                    {/* Application Count Box */}
                    <ModernApplicationCount waitingJobs={curWaitingJobs} rejectedJobs={curRejectedJobs}/>

                    {/* New Application Button */}   
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2px', flexShrink: 0}}>
                        <button style={{height: '40px', width: '150px', borderRadius: '20px'}} onClick={toggleNewApplicationPopup}>New Application</button>
                    </div>      
                    

                    {/* Search Box */}
                    <div style={{width: '100%', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '20px', border: '0.1px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', boxSizing: 'border-box', padding: '8px', gap: '6px', flexShrink: 0}}>
                        <p style={{margin: '0px', fontSize: '20px', color: 'black', fontWeight: '600', flexShrink: 0}}>Search for Company</p>
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="" style={{ width: "65%", marginBottom: '0px', flexShrink: 0 }}/>
                        {/* ALWAYS mounted dropdown — exactly 4 rows (32px each); extra height becomes top/bottom padding */}
                        <div style={{width: '80%', height: '140px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box'}}>
                        <div className='modernSearchResultsContainer' style={{left: 0, width: "100%", height: '128px', flexShrink: 0, overflowY: "auto", overflowX: 'hidden', background: "white",
                                    border: "1px solid black", zIndex: 1000, marginBottom: '0px', boxSizing: 'content-box'  }}>

                            {searchLoading && (
                                <div className='modernSearchLoadingContainer'>
                                    <div className='modernListLoadingBadge'>
                                        <span className='modernListLoadingSpinner'></span>
                                        <span>Loading...</span>
                                    </div>
                                </div>
                            )}
                            {!searchLoading && searchTerm && searchResults.length === 0 && (
                                <div style={{ padding: "8px", color: "gray" }}> No results </div>
                            )}
                            {searchResults.map((job, index) => {
                                const isSelected = selectedJob?.companyName === job.companyName;
                                return (
                                <button
                                    key={index}
                                    type="button"
                                    title={job.companyName}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        display: 'block',
                                        textAlign: 'left',
                                        padding: '0 10px',
                                        border: 'none',
                                        borderBottom: 'solid 0.5px black',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? 'green' : 'transparent',
                                        color: isSelected ? 'white' : (job.rejected === true ? 'red' : 'black'),
                                        fontSize: '14px',
                                        lineHeight: '32px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        boxSizing: 'border-box'
                                    }}
                                    onClick={() => {
                                                        const isSame = selectedJob?.companyName === job.companyName;

                                                        if (isSame) {
                                                            setSelectedJob(null);
                                                            setSelectedCompanyName("");
                                                            setCompanyItem(null);
                                                            setShowEditJobButtons(false);
                                                        } else {
                                                            setSelectedJob(job);
                                                            setSelectedCompanyName(job.companyName);
                                                            setCompanyItem(job);
                                                            setShowEditJobButtons(true);
                                                        }

                                                        setSelectedFromSearch(true);
    }}>
                                            {job.companyName}
                                        </button>
                                    );
                                    })}
                                    
                        </div>
                        </div>
                        <p style={{
                            alignItems: 'center',
                            height: '18px',
                            padding: '0px',
                            margin: '0px',
                            color: selectedCompanyName !== "" ? 'green' : 'transparent',
                            fontSize: '13px',
                            flexShrink: 0,
                            textAlign: 'center',
                            width: '90%',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }}>
                            {selectedCompanyName !== "" ? `Selected: ${selectedCompanyName}` : '\u00A0'}
                        </p>
                        <p style={{
                            width: '90%',
                            margin: '0',
                            padding: '4px 6px',
                            lineHeight: '16px',
                            minHeight: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: actionStatusMessage !== "" ? 'rgba(0, 153, 72, 0.18)' : 'transparent',
                            border: actionStatusMessage !== "" ? '1px solid rgba(0, 153, 72, 0.45)' : '1px solid transparent',
                            color: '#0f5f34',
                            fontWeight: '600',
                            fontSize: '12px',
                            textAlign: 'center',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            visibility: actionStatusMessage !== "" ? 'visible' : 'hidden',
                            boxSizing: 'border-box'
                        }}>
                            {actionStatusMessage || '\u00A0'}
                        </p>
                    </div>          

                    {/* Edit and Delete Job Buttons (conditionally rendered) */}
                    {showEditJobButtons ? 
                        <ModernEditJobButtons text={selectedCompanyName} job={companyItem} listNames={curUserListNames} goToListButton={selectedFromSearch} onRejectedToggled={handleRejectedToggled}/> : 
                        <div className='modernEditJobButtonsContainer'></div>
                    }                

                    {/* List Management Box */}
                    <ModernListManagement
                        listNames={curUserListNames}
                        listName={listName}
                        toggleNewListPopup={toggleNewListPopup}
                        toggleDeletePopup={toggleDeletePopup}
                        canDeleteCurrentList={hasValidCurrentList}
                    />

                    {/* Popups */}
                    {showDeletePopup && hasValidCurrentList ? <ModernDeletePopupV2 func={'list'} companyOrListName={listName} closePopup={toggleDeletePopup} /> : <></>}
                    
                </div>



                {/* Right Column */}
                <div className='modernRightColumn'>
                    <div style={{width: '100%', background: 'rgba(255, 255, 255, 0.4)', height: '100%', minHeight: 0, borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box'}}>
                        <p style={{fontWeight: 'bold', marginBottom: '0px', fontSize: '24px', margin: '0px', textAlign: 'center', width: '100%', transform: 'translateX(calc(-10.5% + 5px))', flexShrink: 0}}> {listName} </p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px', marginTop: '0px', textAlign: 'left', padding: '0 10px', flexShrink: 0}}>
                            <p style={{color: 'green', margin: '0px'}}>Active Applications: {waitingByList}</p>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minHeight: '30px'}}>
                                <p style={{color: 'red', margin: '0px'}}>Rejected Applications: {rejectByList}</p>
                                {isHeaderSortActive ? (
                                    <button
                                        type="button"
                                        className="modernEditJobButton"
                                        onClick={handleResetSort}
                                        style={{
                                            height: '30px',
                                            width: 'fit-content',
                                            minWidth: 0,
                                            padding: '3px 7px',
                                            borderRadius: '20px',
                                            boxSizing: 'border-box',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}
                                    >
                                        Reset Sort
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div style={{textAlign: 'left', marginLeft: '0px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 10px', boxSizing: 'border-box'}}>
                            <div className="modernJobContainer" style={{padding: '0'}}>
                                <header style={{display: 'grid', gridTemplateColumns: rightColumnGridTemplate, position: 'sticky', top: 0, zIndex: 10, width: '100%', marginBottom: '6px', background: '#e8e8e8'}}>
                                    <p className='modernRightColumnHeaders' onClick={() => handleSortChange("companyName")} style={{cursor: 'pointer', backgroundColor: sortField === 'companyName' ? 'rgba(0, 0, 0, 0.1)' : 'transparent', width: 'auto'}}>
                                        Company Name {sortField === 'companyName' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </p>
                                    <p className='modernRightColumnHeaders' onClick={() => handleSortChange("position")} style={{cursor: 'pointer', backgroundColor: sortField === 'position' ? 'rgba(0, 0, 0, 0.1)' : 'transparent', width: 'auto'}}>
                                        Position {sortField === 'position' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </p>
                                    <p className='modernRightColumnHeaders' onClick={() => handleSortChange("location")} style={{cursor: 'pointer', backgroundColor: sortField === 'location' ? 'rgba(0, 0, 0, 0.1)' : 'transparent', width: 'auto'}}>
                                        Location {sortField === 'location' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </p>
                                    <p className='modernRightColumnHeaders' onClick={() => handleSortChange("jobLink")} style={{cursor: 'pointer', backgroundColor: sortField === 'jobLink' ? 'rgba(0, 0, 0, 0.1)' : 'transparent', width: '100%', whiteSpace: 'nowrap', justifyContent: 'center', paddingLeft: '2px', paddingRight: '2px', boxSizing: 'border-box'}}>
                                        Job Link {sortField === 'jobLink' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </p>
                                    <p className='modernRightColumnHeaders' onClick={() => handleSortChange("rejected")} style={{cursor: 'pointer', backgroundColor: sortField === 'rejected' ? 'rgba(0, 0, 0, 0.1)' : 'transparent', width: '100%', whiteSpace: 'nowrap', justifyContent: 'center', paddingLeft: '2px', paddingRight: '2px', boxSizing: 'border-box'}}>
                                        Rejected {sortField === 'rejected' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </p>
                                    <p className='modernRightColumnHeaders' onClick={() => handleSortChange("favorite")} style={{cursor: 'pointer', backgroundColor: sortField === 'favorite' ? 'rgba(0, 0, 0, 0.1)' : 'transparent', width: '100%', whiteSpace: 'nowrap', justifyContent: 'center', paddingLeft: '2px', paddingRight: '2px', boxSizing: 'border-box'}}>
                                        Favorited {sortField === 'favorite' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </p>
                                </header>
                                
                                {/* Print Out All Jobs From This Month */}
                                {listLoading ? (
                                <div className='modernListLoadingContainer'>
                                    <div className='modernListLoadingBadge'>
                                        <span className='modernListLoadingSpinner'></span>
                                        <span>Loading...</span>
                                    </div>
                                </div>
                                ) : (
                                getSortedJobs().map((job, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        const isSame = selectedJob?.companyName === job.companyName;

                                        if (isSame) {
                                            setSelectedJob(null);
                                            setSelectedCompanyName("");
                                            setCompanyItem(null);
                                            setShowEditJobButtons(false);
                                        } else {
                                            setSelectedJob(job);
                                            setSelectedCompanyName(job.companyName);
                                            setCompanyItem(job);
                                            setShowEditJobButtons(true);
                                        }

                                        setSelectedFromSearch(false);
                                    }}
                                    className={selectedJob?.companyName === job.companyName ? "modernUnknown" : "modernJobCard"}
                                    style={{backgroundColor: job.rejected ? 'rgba(255, 0, 0, 0.2)' : 'white', border: selectedJob?.companyName === job.companyName ? '2px solid orange' : '0.1px solid black', display: 'grid', gridTemplateColumns: rightColumnGridTemplate, alignItems: 'center', width: 'calc(100% - 6px)', padding: '10px 0'}}>
                                    <p style={{padding: '0px 0px 0px 2px', margin: '0px', color: job.rejected ? 'red' : 'black', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0}}>
                                        {job.companyName.length > 25 ? job.companyName.slice(0, 25) + '...' : job.companyName}
                                    </p>

                                    <p style={{padding: '0px 0px 0px 2px', margin: '0px', color: job.rejected ? 'red' : 'black', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0}}>
                                        {getDisplayPosition(job.position)}
                                    </p>

                                    <p style={{padding: '0px 0px 0px 2px', margin: '0px', color: job.rejected ? 'red' : 'black', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0}}>
                                        {job.location}
                                    </p>

                                    <a href={job.jobLink} target="_blank" rel="noreferrer" style={{padding: '0px 0px 0px 2px', margin: '0px', textAlign: 'center', color: job.rejected ? 'red' : '', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0}}>
                                        Link
                                    </a>

                                    <input
                                    type='checkbox'
                                    style={{height: '15px', justifySelf: 'center', alignSelf: 'center'}}
                                    checked={job.rejected} readOnly
                                    />

                                    <input
                                    type='checkbox'
                                    style={{height: '15px', justifySelf: 'center', alignSelf: 'center', cursor: 'pointer'}}
                                    checked={job.favorite ?? job.favorited ?? false}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => handleFavoriteToggled(job.companyName, job.favorite ?? job.favorited ?? false)}
                                    />
                                </div>
                                )))}
                            </div>
                            </div>
                        </div>
                </div>

                {showNewListPopup ? <ModernNewListPopup text='NewList' closePopup={toggleNewListPopup} /> : null }
                {showNewApplicationPopup ? <ModernNewApplicationPopup text='NewApplication' closePopup={toggleNewApplicationPopup} listNames={curUserListNames}/> : null }
            </div>
        </div>
    </>);
};

export default ModernUITracker;