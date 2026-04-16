import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

import DeletePopup from './DeletePopup';


const EditJobButtons = ({text, closePopup}) => {

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    async function setRejected() {
        console.log('Updating Rejected: ' + text)

        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/flipRejected" 
                     + "?username=" + localStorage.getItem('username')
                     + "&companyName=" + text;
        
        try {
            const res = await fetch(url, {
                method: "PATCH"
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
        } catch (err) {
            console.error("ERROR:", err);
        }

        window.location.reload()
    }

    async function deleteCompany() {
    }

    const toggleDeletePopup = () => {
        setShowDeletePopup(!showDeletePopup);
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
                <button className='editJobButton'>Edit Application</button>
                <button className='editJobButton' onClick={toggleDeletePopup}>Delete Company</button>
            </div>
            
        {showDeletePopup ? <DeletePopup func={'company'} companyOrListName={text} closePopup={toggleDeletePopup} /> : <></>}
        </div>

        
    );
};
export default EditJobButtons;