import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';
import { useNavigate, useLocation } from "react-router-dom";
import '../../../css/Modern_TrackerPageCSS.css';

import ModernDeletePopupV2 from './ModernDeletePopupv2';
import ModernEditApplicationPopup from './ModernEditApplicationPopup';


const ModernEditJobButtons = ({text, job, listNames, closePopup, goToListButton, onRejectedToggled}) => {

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditApplicationPopup, setShowEditApplicationPopup] = useState(false);
    const [isUpdatingRejected, setIsUpdatingRejected] = useState(false);

    const navigate = useNavigate();

    async function setRejected() {
    if (isUpdatingRejected) return;
    console.log('Updating Rejected: ' + text)
    setIsUpdatingRejected(true);

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

        if (typeof onRejectedToggled === 'function') {
            onRejectedToggled(text, !job.rejected);
        }

    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        setIsUpdatingRejected(false);
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
        <div className='modernEditJobButtonsContainer'>
            <button onClick={setRejected} disabled={isUpdatingRejected} style={{
                            height: '30px',
                            width: '200px',
                            padding: '3px',
                            borderRadius: '20px',
                            cursor: isUpdatingRejected ? 'not-allowed' : 'pointer',
                            opacity: isUpdatingRejected ? 0.7 : 1
            }}>{isUpdatingRejected ? 'Updating...' : 'Set Rejected / Not Rejected'}</button>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <button className='editJobButton' onClick={toggleEditPopup}>Edit Application</button>
                <button className='editJobButton' onClick={toggleDeletePopup}>Delete Company</button>
            </div>
            {goToListButton === true ? <button onClick={goToList}>Go To List</button> : <></>}
            
        {showDeletePopup ? <ModernDeletePopupV2 func={'company'} companyOrListName={text} closePopup={toggleDeletePopup} /> : null}
        {showEditApplicationPopup ? <ModernEditApplicationPopup job={job} listNames={listNames} closePopup={toggleEditPopup}/> : null}
        </div>

        
    );
};
export default ModernEditJobButtons;