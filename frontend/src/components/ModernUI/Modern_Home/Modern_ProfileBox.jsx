import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';

const Modern_ProfileBox = ({userData, closePopup}) => {
    let username = "JFergusooon"
    let role = "SDET | Software Engineer"




    





    return (
        <div className='modernProfileBoxContainer'>
            {/* Left Column */}
            <div style={{width: '20%', justifyContent: 'left'}}>
                <div style={{ width: '75px', height: '75px', borderRadius: '50%', backgroundColor: 'blue', margin: '5px'}}>
                    <img src='person.png' alt='person' style={{width: '60%', height: '60%'}}></img>
                </div>
                <p style={{textAlign: 'left', width: '100%', paddingLeft: '10px'}}>Edit</p>
            </div>

            <div style={{width: '56%', textAlign: 'left', marginLeft: '5px', marginTop: '5px'}}>
                <p className='modernProfileBoxTitle'> {userData?.username} </p>
                <p style={{marginTop: '2px', fontSize: '20px', marginBottom: '0px'}}> {userData?.careerTitle
                    ?.replace(/[{}"]/g, "")?.split(",")?.map(t => t.trim())?.join(" | ")} 
                </p>
                
                <p style={{margin: '0px', marginTop: '60px'}}>{userData?.location}</p>
            </div>

            <div style={{justifyContent: 'right'}}>
                <p style={{marginTop: '5px'}}>Joined {userData?.dateCreated?.split("/")[0] + "/" + userData?.dateCreated?.split("/")[2]}</p>
            </div>
            
            
        </div>
    );
};
export default Modern_ProfileBox;