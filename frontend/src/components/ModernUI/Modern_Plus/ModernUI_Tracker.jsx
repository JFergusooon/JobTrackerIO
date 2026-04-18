import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../../../css/Modern_TrackerPageCSS.css'
import Modern_EditJobButtons from '../Modern_Tracker/Modern_EditJobButtons.jsx';
import Modern_NewListPopup from '../Modern_Tracker/Modern_NewListPopup.jsx';
import Modern_NewApplicationPopup from '../Modern_Tracker/Modern_NewApplicationPopup.jsx'
import Modern_DeletePopup from '../Modern_Tracker/Modern_DeletePopup.jsx';
import Modern_ListManagement from '../Modern_Tracker/Modern_ListManagement.jsx';
import Modern_NewDeleteList from '../Modern_Tracker/Modern_NewDeleteList.jsx';
import Modern_ApplicationCount from '../Modern_Tracker/Modern_ApplicationCount.jsx';
import LegacyToggle from '../../LegacyUI/Legacy_Plus/LegacyToggle.jsx';

function ModernUI_Tracker() { 

    const [allJobs, setAllJobs] = useState([]);

    const [selectedCompanyName, setSelectedCompanyName] = useState("");
    const [companyItem, setCompanyItem] = useState();
    
    const [selectedFromSearch, setSelectedFromSearch] = useState();
    const [selectedId, setSelectedId] = useState(null);

    const [showEditJobButtons, setShowEditJobButtons] = useState(false);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [showNewApplicationPopup, setShowNewApplicationPopup] = useState(false);

    const [curJobsByListName, setCurJobsByListName] = useState([]);
    const waitingByList = curJobsByListName.filter(job => !job.rejected).length;
    const rejectByList = curJobsByListName.filter(job => job.rejected).length;

    const [selectedSearchIndex, setSelectedSearchIndex] = useState(null);


    const [selectedJob, setSelectedJob] = useState(null);

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [curUserListNames, setCurUserListNames] = useState([]);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const curWaitingJobs = allJobs.filter(job => !job.rejected).length;
    const curRejectedJobs = allJobs.filter(job => job.rejected).length;

    const location = useLocation();
    const listName = new URLSearchParams(location.search).get("listName");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

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

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetchSearchResults();
        }, 300); // debounce

        return () => clearTimeout(timeout);
    }, [searchTerm]);
    
    const fetchSearchResults = async () => {
        setSearchLoading(true);

        try {
            const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
            const url = `${stage}/Jobs/getByUsername?username=${localStorage.getItem("username")}`;

            const res = await fetch(url);
            const data = await res.json();

            const filtered = data.filter(job =>
                job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setSearchResults(filtered);
        } catch (err) {
            console.error(err);
        }

        setSearchLoading(false);
    };

    useEffect(() => {
        if (!listName) return;

        let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        let url = `${stage_url}/Jobs/getByListName?username=${localStorage.getItem('username')}&listName=${listName}`;
        let encode = window.btoa("admin:admin");

        fetch(url, {
            headers: { 'Authorization': 'Basic ' + encode },
            method: "GET"
        })
        .then(res => res.json())
        .then(
            (result) => {
                setIsLoaded(true);
                setCurJobsByListName(result);
            },
            (error) => {
                setIsLoaded(true);
                setError(error);
                
            }
        );

    }, [listName]);   // 👈 THIS IS THE KEY FIX

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
                                setIsLoaded(true);
                                setCurUserListNames(result['listNames']);
                            },
                            (error) => {
                                setIsLoaded(true);
                                setError(error);
                            }
                        )
                }, [])

    const toggleNewListPopup = () => {
        setShowNewListPopup(!showNewListPopup);
    }

    const toggleNewApplicationPopup = () => {
        setSelectedCompanyName("");
        setShowNewApplicationPopup(!showNewApplicationPopup);
    }

    const toggleDeletePopup = () => {
        setShowDeletePopup(!showDeletePopup);
    }

    
    const GRID_SIZE = 9; // 3 columns x 3 rows

    const filledLists = Array.from({ length: GRID_SIZE }, (_, i) => {
        return curUserListNames[i] || null;
    });

    useEffect(() => {
        setSelectedId(null);
    }, [curJobsByListName]);

    return (<>
        <div style={{width: '100%', height: '100%', overflow: 'hidden', marginTop: '30px'}}>
            <div className='modernTrackerContainer'>
                {/*Left Column*/}
                <div className='modernLeftColumn'>
            
                    {/* Application Count Box */}
                    <Modern_ApplicationCount waitingJobs={curWaitingJobs} rejectedJobs={curRejectedJobs}/>

                    {/* New Application Button */}   
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2px'}}>
                        <LegacyToggle />
                        <button style={{height: '40px', width: '150px', borderRadius: '20px'}} onClick={toggleNewApplicationPopup}>New Application</button>
                    </div>      
                    

                    {/* Search Box */}
                    <div style={{height: '35%', maxHeight: '35%', width: '100%', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '20px', border: '0.1px solid black', display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
                        <p style={{margin: '0px', fontSize: '20px'}}>Search for Company:</p>
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="" style={{ width: "65%", marginBottom: '10px' }}/>
                        {/* ALWAYS mounted dropdown */}
                        <div style={{left: 0, width: "80%", height: "150px", overflowY: "auto", background: "white", maxHeight: '150px', minHeight: '150px',
                                    border: "1px solid black", zIndex: 1000, marginBottom: '10px'  }}>

                            {searchLoading && ( <div style={{ padding: "8px" }}>Loading...</div> )}
                            {!searchLoading && searchTerm && searchResults.length === 0 && (
                                <div style={{ padding: "8px", color: "gray" }}> No results </div>
                            )}
                            {searchResults.map((job, index) => (
                                <button key={index} style={{ backgroundColor: selectedJob?.companyName === job.companyName ? "green" : "transparent",
                                                            color: job.rejected === true ? "red" : "black"}} 
                                                    className="modernSearchResultsDiv" onClick={() => {
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
                                            {job.companyName.length > 25
                                                ? job.companyName.slice(0, 25) + "..."
                                                : job.companyName}
                                        </button>
                                    ))}
                                    
                        </div>
                        {selectedCompanyName !== "" ? <p style={{alignItems: 'center', height: '20px', padding: '2px', margin: '0px', marginBottom: '5px', color: selectedCompanyName !== "" ? 'green' : ""}}>Selected: {selectedCompanyName}</p> : 
                                                      <p style={{alignItems: 'center', height: '20px', padding: '2px', margin: '0px', marginBottom: '5px'}}></p>}
                    </div>          

                    {/* Edit and Delete Job Buttons (conditionally rendered) */}
                    {showEditJobButtons ? 
                        <Modern_EditJobButtons text={selectedCompanyName} job={companyItem} goToListButton={selectedFromSearch}/> : 
                        <div className='modernEditJobButtonsContainer'></div>
                    }                
                

                    {/* List Management Box */}
                    <Modern_ListManagement filledLists={filledLists} listName={listName}/>
                    
                    {/* New and Delete List Buttons */}
                    <Modern_NewDeleteList toggleDeletePopup={toggleDeletePopup} toggleNewListPopup={toggleNewListPopup}/>

                    {/* Popups */}
                    {showDeletePopup ? <Modern_DeletePopup func={'list'} companyOrListName={listName} closePopup={toggleDeletePopup} /> : <></>}
                    
                </div>



                {/* Right Column */}
                <div className='modernRightColumn'>
                    <div style={{width: '100%', background: 'rgba(255, 255, 255, 0.4)', height: '100%', borderRadius: '20px'}}>
                        <p style={{fontWeight: 'bold', marginBottom: '0px', fontSize: '24px', margin: '0px'}}> {listName} </p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '20px', marginBottom: '10px', marginTop: '0px', textAlign: 'left'}}>
                            <p style={{color: 'green', margin: '0px'}}>Active Applications: {waitingByList}</p>
                            <p style={{color: 'red', margin: '0px'}}>Rejected Applications: {rejectByList}</p>
                            <header style={{display: 'flex', flexDirection: 'row', position: 'sticky',top: 0, zIndex: 10}}> 
                                    <p className='modernRightColumnHeaders'>CompanyName</p>
                                    <p className='modernRightColumnHeaders'>Position</p>
                                    <p className='modernRightColumnHeaders'>Location</p>
                                    <p className='modernRightColumnHeaders'>Job Link</p>
                                    <p className='modernRightColumnHeaders'>Rejected</p>
                                </header>
                        </div>

                        <div style={{textAlign: 'left', marginLeft: '0px'}}>
                            
                        <div style={{display: 'flex', flexDirection: 'row', gap: '25%'}}>

                            <div className="modernJobContainer">
                                
                                {/* Print Out All Jobs From This Month */}
                                {curJobsByListName.map((job, index) => (
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
                                    style={{backgroundColor: job.rejected ? 'rgba(255, 0, 0, 0.2)' : 'white', border: selectedJob?.companyName === job.companyName ? '2px solid orange' : '0.1px solid black'}}>
                                    <p style={{paddingLeft: '10px', padding: '0px', margin: '0px', width: '20%', color: job.rejected ? 'red' : 'black'}}>
                                    {job.companyName.length > 30
                                        ? job.companyName.slice(0, 30) + "..."
                                        : job.companyName}
                                    </p>

                                    <p style={{padding: '0px', margin: '0px', width: '20%', color: job.rejected ? 'red' : 'black'}}>
                                    {job.position.length > 30
                                        ? job.position.slice(0, 30) + "..."
                                        : job.position}
                                    </p>

                                    <p style={{padding: '0px', margin: '0px', width: '20%', color: job.rejected ? 'red' : 'black'}}>
                                    {job.location.length > 30
                                        ? job.location.slice(0, 30) + "..."
                                        : job.location}
                                    </p>

                                    <a href={job.jobLink} target="_blank" rel="noreferrer" style={{padding: '0px', margin: '0px', width: '20%', textAlign: 'left', color: job.rejected ? 'red' : ''}}>
                                    {job.jobLink.length > 30
                                        ? job.jobLink.slice(0, 30) + "..."
                                        : job.jobLink}
                                    </a>

                                    <input
                                    type='checkbox'
                                    style={{height: '15px', width: '20%'}}
                                    checked={job.rejected} readOnly
                                    />
                                </div>
                                ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>

                {showNewListPopup ? <Modern_NewListPopup text='NewList' closePopup={toggleNewListPopup} /> : null }
                {showNewApplicationPopup ? <Modern_NewApplicationPopup text='NewApplication' closePopup={toggleNewApplicationPopup} listNames={curUserListNames}/> : null }
            </div>
        </div>
    </>);
};

export default ModernUI_Tracker;