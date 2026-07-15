import React, {useState} from 'react';
import '../../../css/Modern_HomePageCSS.css';
import { useNavigate } from "react-router-dom";
import '../../../css/Modern_TrackerPageCSS.css';

import ModernDeletePopupV2 from './ModernDeletePopupv2';
import ModernEditApplicationPopup from './ModernEditApplicationPopup';


const ModernEditJobButtons = ({text, job, listNames, goToListButton, onRejectedToggled}) => {

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


    const actionButtonStyle = {
        height: '30px',
        width: 'fit-content',
        minWidth: 0,
        padding: '3px 7px',
        borderRadius: '20px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap'
    };

    return (
        <div className='modernEditJobButtonsContainer'>
            <div style={{display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center', justifyContent: 'center'}}>
                <button className='modernEditJobButton' onClick={toggleEditPopup} style={actionButtonStyle}>Edit Application</button>
                <button className='modernEditJobButton' onClick={toggleDeletePopup} style={actionButtonStyle}>Delete Application</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center', justifyContent: 'center'}}>
                <button
                    onClick={setRejected}
                    disabled={isUpdatingRejected}
                    className='modernEditJobButton'
                    style={{
                        ...actionButtonStyle,
                        cursor: isUpdatingRejected ? 'not-allowed' : 'pointer',
                        opacity: isUpdatingRejected ? 0.7 : 1
                    }}
                >
                    {isUpdatingRejected ? 'Updating...' : 'Set Rejected Status'}
                </button>
                {goToListButton === true ? (
                    <button
                        className='modernEditJobButton'
                        onClick={goToList}
                        style={actionButtonStyle}
                    >
                        Go To List
                    </button>
                ) : null}
            </div>
            
        {showDeletePopup ? <ModernDeletePopupV2 func={'company'} companyOrListName={text} closePopup={toggleDeletePopup} /> : null}
        {showEditApplicationPopup ? <ModernEditApplicationPopup job={job} listNames={listNames} closePopup={toggleEditPopup}/> : null}
        </div>

        
    );
};
export default ModernEditJobButtons;