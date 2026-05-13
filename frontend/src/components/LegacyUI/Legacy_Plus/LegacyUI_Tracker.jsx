import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../../../css/Legacy_TrackerPageCSS.css'
import EditJobButtons from '../Legacy_Tracker/Legacy_EditJobButtons.jsx'
import NewListPopup from '../Legacy_Tracker/Legacy_NewListPopup.jsx';
import NewApplicationPopup from '../Legacy_Tracker/Legacy_NewApplicationPopup.jsx'
import DeletePopup from '../Legacy_Tracker/Legacy_DeletePopup.jsx';

function LegacyUI_Tracker() { 

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

    const navigate = useNavigate();
    const GRID_SIZE = 9; // 3 columns x 3 rows

    const filledLists = Array.from({ length: GRID_SIZE }, (_, i) => {
        return curUserListNames[i] || null;
    });

    useEffect(() => {
        setSelectedId(null);
    }, [curJobsByListName]);

    return (<>
        <div style={{width: '100%', height: '100vh', backgroundColor: 'green', marginTop: '30px'}}>
            <div className='trackerContainer'>
                {/*Left Column*/}
                <div className='leftColumn'>
            
                <div style={{backgroundColor: '#3b393f', display: 'flex', justifyContent: 'center', gap: '30px', width: '60%'}}>
                    <div>
                        <p style={{color: 'white'}}>Waiting: </p>
                        <p style={{color: 'green'}}>{curWaitingJobs}</p>
                    </div>

                    <div>
                        <p style={{color: 'white'}}>Rejected: </p>
                        <p style={{color: 'red'}}>{curRejectedJobs}</p>
                    </div>
                </div>

                <div style={{height: '35%', width: '100%', background: 'orange', display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
                    <p style={{margin: '0px', fontSize: '20px'}}>Search for Company:</p>
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="" style={{ width: "65%", marginBottom: '10px' }}/>
                    {/* ALWAYS mounted dropdown */}
                    <div style={{left: 0, width: "80%", height: "200px", overflowY: "auto", background: "white",
                                 border: "1px solid black", zIndex: 1000, marginBottom: '10px'  }}>

                        {searchLoading && ( <div style={{ padding: "8px" }}>Loading...</div> )}
                        {!searchLoading && searchTerm && searchResults.length === 0 && (
                            <div style={{ padding: "8px", color: "gray" }}> No results </div>
                        )}
                        {searchResults.map((job, index) => (
                            <button key={index} style={{ backgroundColor: selectedJob?.companyName === job.companyName ? "green" : "transparent",
                                                         color: selectedSearchIndex === index ? "white" : "black"}} 
                                                className="searchResultsDiv" onClick={() => {
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
                            <p style={{margin: '0px', marginBottom: '5px', color: selectedCompanyName !== "" ? 'green' : ""}}>{selectedCompanyName !== "" ? `Selected: ${selectedCompanyName}` : ""}</p>
                        </div>          

                        <div>            
                            <button style={{height: '40px', width: '150px', borderRadius: '20px'}} onClick={toggleNewApplicationPopup}>New Application</button>
                        </div>

                        {/* List Management Box */}
                        <div style={{background: 'grey', padding: '5px'}}>
                            <p style={{margin: '0px', fontSize: '20px', color: 'white'}}>--- List Management ---</p>
                            <p style={{margin: '0px', fontSize: '16px', color: 'white'}}>Current List: {listName}</p>
                        
                            <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 90px)', gap: '5px' }}>
                                    {filledLists.map((name, index) => (
                                        <button
                                            key={index}
                                            disabled={!name}
                                            style={{
                                                height: '30px',
                                                width: '90px',
                                                borderRadius: '20px',
                                                opacity: name ? 1 : 0.3,
                                                cursor: name ? 'pointer' : 'not-allowed',
                                                backgroundColor: listName !== name ? "" : "green"
                                            }}
                                            onClick={() => name && navigate(`/tracker?listName=${name}`)}
                                        >
                                            {name || "Empty"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row', gap: '2%'}}>
                            <button onClick={toggleNewListPopup} style={{height: '30px', width: '120px', borderRadius: '20px'}}>+ New List</button>
                            <button onClick={toggleDeletePopup} style={{height: '30px', width: '150px', borderRadius: '20px'}}>Delete Current List</button>
                        </div>
                        
            
                        {showDeletePopup ? <DeletePopup func={'list'} companyOrListName={listName} closePopup={toggleDeletePopup} /> : <></>}
                        {showEditJobButtons ? <EditJobButtons text={selectedCompanyName} job={companyItem} goToListButton={selectedFromSearch}/> : <></>}
                    </div>

                    {/* Right Column */}
                    <div className='rightColumn'>
                        <div style={{width: '100%', backgroundColor: 'lightblue', height: '100%'}}>
                            <p style={{fontWeight: 'bold'}}>{listName}</p>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '20px', paddingLeft: '20px'}}>
                                <p style={{color: 'green'}}>Active Applications: {waitingByList}</p>
                                <p style={{color: 'red'}}>Rejected Applications: {rejectByList}</p>
                            </div>

                        <div style={{textAlign: 'left', marginLeft: '20px'}}>
                            <div style={{display: 'flex', flexDirection: 'row', background: 'red'}}>
                                <p style={{paddingLeft: '20px', width: '85%'}}>Applications</p>
                                <p>Sort By: {'location'}</p>
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'row', gap: '15%'}}>

                                <div style={{marginLeft: '20px'}} className="job-container">
                                    <div style={{display: 'flex', flexDirection: 'row'}}> 
                                        <p className='rightColumnHeaders'>CompanyName</p>
                                        <p className='rightColumnHeaders'>Position</p>
                                        <p className='rightColumnHeaders'>Location</p>
                                        <p className='rightColumnHeaders'>Job Link</p>
                                        <p className='rightColumnHeaders'>Rejected</p>
                                    </div>
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
                                        className={selectedJob?.companyName === job.companyName ? "unknown" : "job-card"}>
                                        <p style={{padding: '0px', margin: '0px', width: '20%', color: job.rejected ? 'red' : 'black'}}>
                                        {job.companyName}
                                        </p>

                                        <p style={{padding: '0px', margin: '0px', width: '20%', color: job.rejected ? 'red' : 'black'}}>
                                        {job.position}
                                        </p>

                                        <p style={{padding: '0px', margin: '0px', width: '20%', color: job.rejected ? 'red' : 'black'}}>
                                        {job.location}
                                        </p>

                                        <a href={job.jobLink} target="_blank" rel="noreferrer" style={{padding: '0px', margin: '0px', width: '20%', textAlign: 'left', color: job.rejected ? 'red' : ''}}>
                                        {job.jobLink.length > 25
                                            ? job.jobLink.slice(0, 25) + "..."
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

                    {showNewListPopup ? <NewListPopup text='NewList' closePopup={toggleNewListPopup} /> : null }
                    {showNewApplicationPopup ? <NewApplicationPopup text='NewApplication' closePopup={toggleNewApplicationPopup} listNames={curUserListNames}/> : null }
                </div>
            </div>
        </>
    );
};

export default LegacyUI_Tracker;