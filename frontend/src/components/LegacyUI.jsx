import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../css/TrackerPageCSS.css'
import EditJobButtons from '../components/Tracker/EditJobButtons'
import NewListPopup from '../components/Tracker/NewListPopup.jsx';
import NewApplicationPopup from '../components/Tracker/NewApplicationPopup.jsx'

function LegacyUI() { 

    const [curSearchResults, setCurSearchResult] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");

    const [showEditJobButtons, setShowEditJobButtons] = useState(false);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [showNewApplicationPopup, setShowNewApplicationPopup] = useState(false);

    const [curJobsByListName, setCurJobsByListName] = useState([]);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [curUserListNames, setCurUserListNames] = useState([]);



    const location = useLocation();
    const listName = new URLSearchParams(location.search).get("listName");


    
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
                console.log("Getting all JOBS by ListName: " + JSON.stringify(result));
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
                                console.log("Getting All Lists By User: " + JSON.stringify(result['listNames']));
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
        setShowNewApplicationPopup(!showNewApplicationPopup);
    }

    const navigate = useNavigate();
    const GRID_SIZE = 9; // 3 columns x 3 rows

    const filledLists = Array.from({ length: GRID_SIZE }, (_, i) => {
        return curUserListNames[i] || null;
    });

    return (
        <>
            <div style={{width: '100%', height: '100vh', backgroundColor: 'green'}}>

                <div className='trackerContainer'>
                    {/* Left Column */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', background: 'blue', padding: '5px', alignItems: 'center'}}>
            
                        <div style={{backgroundColor: '#3b393f', display: 'flex', justifyContent: 'center', gap: '30px', width: '60%'}}>
                            <div>
                                <p style={{color: 'white'}}>Waiting: </p>
                                <p style={{color: 'green'}}>1271</p>
                            </div>

                            <div>
                                <p style={{color: 'white'}}>Rejected: </p>
                                <p style={{color: 'red'}}>538</p>
                            </div>
                        </div>

                        <div style={{height: '40%', width: '100%', background: 'orange', display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
                            <p style={{margin: '0px', fontSize: '20px'}}>Search Company</p>
                            <input onChange={({ target }) => setCurSearchResult(target.value)}></input>
                            <textarea style={{height: '60%', width: '65%'}} disabled={true} value={curSearchResults}></textarea>

                            <button style={{height: '40px', width: '150px', borderRadius: '20px'}} onClick={toggleNewApplicationPopup}>New Application</button>
                            <p style={{margin: '0px', marginBottom: '10px'}}>Selected: {selectedCompany}</p>
                        </div>

                        <div>
                        </div>

                        {/* List Management Box */}
                        <div style={{background: 'grey', padding: '5px'}}>
                            <p style={{margin: '0px', fontSize: '20px', color: 'white'}}>--- List Management ---</p>
                            <p style={{margin: '0px', fontSize: '16px', color: 'white'}}>Current List: {listName}</p>
                        
                            <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 90px)', gap: '5px' }}>
                                    {filledLists.map((listName, index) => (
                                        <button
                                            key={index}
                                            disabled={!listName}
                                            style={{
                                                height: '30px',
                                                width: '90px',
                                                borderRadius: '20px',
                                                opacity: listName ? 1 : 0.3,
                                                cursor: listName ? 'pointer' : 'not-allowed'
                                            }}
                                            onClick={() => listName && navigate(`/tracker?listName=${listName}`)}
                                        >
                                            {listName || "Empty"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={toggleNewListPopup}>+ New List</button>
                        <button>Delete Current List</button>
            
                        {showEditJobButtons ? <EditJobButtons /> : <></>}
                    </div>




                    {/* Right Column */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '30px', width: '95%',background: '#b80e0e'}}>
                        <div style={{width: '100%', backgroundColor: 'lightblue', height: '100%'}}>
                        <p style={{fontWeight: 'bold'}}>{listName}</p>

                        <div style={{textAlign: 'left', marginLeft: '20px'}}>
                            <div style={{display: 'flex', flexDirection: 'row', background: 'red'}}>
                                <p style={{paddingLeft: '20px', width: '85%'}}>Applications</p>
                                <p>Sort By: {'location'}</p>
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'row', gap: '15%'}}>

                                <div style={{marginLeft: '20px'}} className="job-container">
                                    <div style={{display: 'flex', flexDirection: 'row'}}> 
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>CompanyName</p>
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>Position</p>
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>Location</p>
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>Job Link</p>
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>Rejected</p>
                                    </div>
                                    {/* Print Out All Jobs From This Month */}
                                    {curJobsByListName.map((job, index) => (
                                    <div key={index} className="job-card">
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>{job.companyName}</p>
                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>{job.position}</p>
                                        

                                        <p style={{padding: '0px', margin: '0px', width: '20%'}}>{job.location}</p>
                                        <a href={job.jobLink}>
    {job.jobLink.length > 25
        ? job.jobLink.slice(0, 25) + "..."
        : job.jobLink}
</a>
                                        <input type='checkbox' placeholder='rejected' style={{height: '15px', width: '20%'}}></input>
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

export default LegacyUI;