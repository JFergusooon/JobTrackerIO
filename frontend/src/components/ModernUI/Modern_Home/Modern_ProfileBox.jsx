import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../../../css/Modern_HomePageCSS.css';

const Modern_ProfileBox = ({userData, closePopup}) => {
    const navigate = useNavigate();
    let username = "JFergusooon"
    let role = "SDET | Software Engineer"

    const formattedCareerTitle = (userData?.careerTitle || '')
        .replace(/[{}"]/g, '')
        .split(',')
        .map((titlePart) => titlePart.trim())
        .filter(Boolean)
        .join(' | ');


    return (
        <div className='modernProfileBoxContainer'>
            {/* Left Column */}
            <div style={{width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
                <div style={{ width: '75px', height: '75px', borderRadius: '50%', backgroundColor: 'var(--nav-background)', margin: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img src='person.png' alt='person' style={{width: '60%', height: '60%'}}></img>
                </div>
                <p className='modernQuickSettingsButton' onClick={() => navigate('/settings')} style={{textAlign: 'center', margin: '2px 0 0 0', width: 'fit-content', height: 'auto', padding: '1px 6px', cursor: 'pointer', fontSize: '12px'}}>Edit</p>
            </div>

            <div style={{width: '56%', textAlign: 'left', marginLeft: '5px', marginTop: '5px'}}>
                <p className='modernProfileBoxTitle'> {userData?.username} </p>
                <p style={{marginTop: '2px', fontSize: '20px', marginBottom: '0px'}}> {formattedCareerTitle} 
                </p>
                
                <p style={{margin: '0px', marginTop: '8px'}}>{userData?.location}</p>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', width: '24%', paddingRight: '16px'}}>
                <p style={{marginTop: '5px'}}>Joined {userData?.dateCreated?.split("/")[0] + "/" + userData?.dateCreated?.split("/")[2]}</p>
            </div>
            
            
        </div>
    );
};
export default Modern_ProfileBox;