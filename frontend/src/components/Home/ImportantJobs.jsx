import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

const ImportantJobs = ({importantJobsList, closePopup}) => {


    return (
        <div className='importantJobsContainer'>
            <p className='importantJobsTitle'> Important Interviews </p>
            <div style={{background: 'yellow', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <div style={{height: '150px', background: '#07c5b5', border: '1px solid black', margin: '5px'}}></div>
                <div style={{height: '150px', background: '#07c5b5', border: '1px solid black', margin: '5px'}}></div>
                <div style={{height: '150px', background: '#07c5b5', border: '1px solid black', margin: '5px'}}></div>
            </div>
        </div>
    );
};
export default ImportantJobs;