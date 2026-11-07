import React, {useRef, useState} from 'react';
import '../../../css/Modern_HomePageCSS.css';
import { useNavigate } from "react-router-dom";
import '../../../css/Modern_TrackerPageCSS.css';

import ModernDeletePopupV2 from './ModernDeletePopupv2';
import ModernEditApplicationPopup from './ModernEditApplicationPopup';
import { playSuccessDing, prepareSuccessDing } from '../../../successDing';


const isRejectedValue = (value) => value === true || value === 'true' || value === 'True';

const readRejectedResult = (data, fallback) => {
    let payload = data;
    if (typeof payload?.body === 'string') {
        try {
            payload = JSON.parse(payload.body);
        } catch {
            payload = data;
        }
    } else if (payload?.body && typeof payload.body === 'object') {
        payload = payload.body;
    }

    if (payload?.error) {
        throw new Error(payload.error);
    }

    if (payload?.rejected === undefined || payload?.rejected === null) {
        return fallback;
    }
    return isRejectedValue(payload.rejected);
};

const ModernEditJobButtons = ({text, job, listNames, goToListButton, onRejectedToggled, onRejectionFailed, onApplicationUpdated, onApplicationDeleted}) => {

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditApplicationPopup, setShowEditApplicationPopup] = useState(false);
    const [isUpdatingRejected, setIsUpdatingRejected] = useState(false);
    const rejectedRequestRef = useRef(false);
    const jobRef = useRef(job);
    jobRef.current = job;

    const navigate = useNavigate();

    async function setRejected() {
    if (rejectedRequestRef.current) return;
    const companyName = text;
    const nextRejected = !isRejectedValue(jobRef.current?.rejected);
    console.log('Updating Rejected: ' + companyName)
    prepareSuccessDing();
    rejectedRequestRef.current = true;
    setIsUpdatingRejected(true);

    const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
    const url = stage + "/Jobs/flipRejected"
                 + "?username=" + localStorage.getItem('username')
                 + "&companyName=" + encodeURIComponent(companyName);

    try {
        const res = await fetch(url, {
            method: "PATCH"
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const savedRejected = readRejectedResult(data, nextRejected);
        console.log("SUCCESS:", data);
        playSuccessDing();

        if (typeof onRejectedToggled === 'function') {
            onRejectedToggled(companyName, savedRejected);
        }

    } catch (err) {
        console.error("ERROR:", err);
        if (typeof onRejectionFailed === 'function') {
            onRejectionFailed(companyName);
        }
    } finally {
        rejectedRequestRef.current = false;
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
            
        {showDeletePopup ? (
            <ModernDeletePopupV2
                func={'company'}
                companyOrListName={text}
                closePopup={toggleDeletePopup}
                onApplicationDeleted={onApplicationDeleted}
            />
        ) : null}
        {showEditApplicationPopup ? (
            <ModernEditApplicationPopup
                job={job}
                listNames={listNames}
                closePopup={toggleEditPopup}
                onApplicationUpdated={onApplicationUpdated}
            />
        ) : null}
        </div>

        
    );
};
export default ModernEditJobButtons;