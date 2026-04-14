import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';


const EditJobButtons = ({text, closePopup}) => {


    return (
        <div className='editJobButtonsContainer'>
            <button style={{
                            height: '30px',
                            width: '200px',
                            padding: '3px',
                            borderRadius: '20px'
            }}>Set Rejected / Not Rejected</button>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <button className='editJobButton'>Edit Application</button>
                <button className='editJobButton'>Delete Company</button>
            </div>
            
        </div>
    );
};
export default EditJobButtons;