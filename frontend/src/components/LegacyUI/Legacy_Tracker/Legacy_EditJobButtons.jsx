import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Legacy_HomePageCSS.css';
import { useNavigate, useLocation } from "react-router-dom";

import DeletePopup from './Legacy_DeletePopup';
import EditApplicationPopup from './Legacy_EditApplicationPopup';


const Legacy_EditJobButtons = ({text, job, closePopup, goToListButton}) => {

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditApplicationPopup, setShowEditApplicationPopup] = useState(false);

    const navigate = useNavigate();

    async function setRejected() {
    console.log('Updating Rejected: ' + text)

    const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
    const url = stage + "/Jobs/flipRejected" 
                 + "?username=" + localStorage.getItem('username')
                 + "&companyName=" + encodeURIComponent(text);

    try {
        const res = await fetch(url, {
            method: "PATCH"
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("SUCCESS:", data);

        // ✅ only reload AFTER success is confirmed
        if(res.status === 200) {
            window.location.reload()
        }

    } catch (err) {
        console.error("ERROR:", err);
    }
}

    const toggleDeletePopup = () => {
        setShowDeletePopup(!showDeletePopup);
    }

    const toggleEditPopup = () => {
        setShowEditApplicationPopup(!showEditApplicationPopup);
    }

    const goToList =() => {
        navigate(`/tracker?listName=${job.list}`)
    }


    return (
        <div className='editJobButtonsContainer'>
            <button onClick={setRejected} style={{
                            height: '30px',
                            width: '200px',
                            padding: '3px',
                            borderRadius: '20px'
            }}>Set Rejected / Not Rejected</button>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <button className='editJobButton' onClick={toggleEditPopup}>Edit Application</button>
                <button className='editJobButton' onClick={toggleDeletePopup}>Delete Company</button>
            </div>
            {goToListButton === true ? <button onClick={goToList}>Go To List</button> : <></>}
            
        {showDeletePopup ? <DeletePopup func={'company'} companyOrListName={text} closePopup={toggleDeletePopup} /> : null}
        {showEditApplicationPopup ? <EditApplicationPopup job={job} closePopup={toggleEditPopup}/> : null}
        </div>

        
    );
};
export default Legacy_EditJobButtons;