import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';


const EditJobButtons = ({text, closePopup}) => {


    return (
        <div className='editJobButtonsContainer'>
            <div style={{background: 'grey',
                            height: '30px',
                            width: '200px',
                            padding: '3px',
                            borderRadius: '10px'
            }}>Set Rejected / Not Rejected</div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div className='editJobButton'>Edit Application</div>
                <div className='editJobButton'>Delete Company</div>
            </div>
            
        </div>
    );
};
export default EditJobButtons;