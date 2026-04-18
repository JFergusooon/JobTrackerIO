import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';

const Modern_ImportantJobs = ({importantJobsList, closePopup}) => {


    return (
        <div className='modernImportantJobsContainer'>
            <p className='modernImportantJobsTitle'> Important Interviews </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>
                <div style={{height: '140px', background: '#07c5b5', border: '1px solid black', margin: '5px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px'}}>
                        <p style={{margin: '0px', textAlign: 'left'}}>Ferguson Software Solution</p>
                        <p style={{margin: '0px', textAlign: 'left'}}>Software Engineer</p>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', gap: '3px', margin: '5px', textAlign: 'left', alignItems: 'left', justifyContent: 'left'}}>
                        <p style={{margin: '0px'}}>Interview Date: 2024-07-01</p>
                        <p style={{margin: '0px'}}>Stage 1</p>
                    </div>
                    
                </div>
                <div style={{height: '140px', background: '#07c5b5', border: '1px solid black', margin: '5px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px'}}>
                        <p style={{margin: '0px', textAlign: 'left'}}>Ferguson Software Solution</p>
                        <p style={{margin: '0px', textAlign: 'left'}}>Software Engineer</p>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', gap: '3px', margin: '5px', textAlign: 'left', alignItems: 'left', justifyContent: 'left'}}>
                        <p style={{margin: '0px'}}>Interview Date: 2024-07-01</p>
                        <p style={{margin: '0px'}}>Stage 1</p>
                    </div>
                </div>
                <div style={{height: '140px', background: '#07c5b5', border: '1px solid black', margin: '5px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px'}}>
                        <p style={{margin: '0px', textAlign: 'left'}}>Ferguson Software Solution</p>
                        <p style={{margin: '0px', textAlign: 'left'}}>Software Engineer</p>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', gap: '3px', margin: '5px', textAlign: 'left', alignItems: 'left', justifyContent: 'left'}}>
                        <p style={{margin: '0px'}}>Interview Date: 2024-07-01</p>
                        <p style={{margin: '0px'}}>Stage 1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Modern_ImportantJobs;