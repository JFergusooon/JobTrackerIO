import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

const ProfileBox = ({text, closePopup}) => {
    let username = "JFergusooon"
    let role = "SDET | Software Engineer"

    const [userInfo, setUserInfo] = useState();

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
            let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
            let url = stage_url + "/Users/getByUsername?username=" + localStorage.getItem('username')
            let encode = window.btoa("admin:admin");
            fetch(url, {
                headers: {
                    'Authorization':  'Basic ' + encode
                }}    
            )
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log("getting all applications from this month: " + JSON.stringify(result));
                        setIsLoaded(true);
                        setUserInfo(result);
                    },
                    (error) => {
                        setIsLoaded(true);
                        setError(error);
                    }
                )
        }, [])





    return (
        <div className='profileBoxContainer'>
            {/* Left Column */}
            <div style={{width: '20%', justifyContent: 'left'}}>
                <div style={{ width: '75px', height: '75px', borderRadius: '50%', backgroundColor: 'blue', margin: '5px'}}>
                    <img src='person.png' alt='person' style={{width: '60%', height: '60%'}}></img>
                </div>
                <p style={{textAlign: 'left', width: '100%', paddingLeft: '10px'}}>Edit</p>
            </div>

            <div style={{width: '56%', textAlign: 'left', marginLeft: '5px', marginTop: '5px'}}>
                <p className='profileBoxTitle'> {userInfo?.username} </p>
                <p style={{marginTop: '2px', fontSize: '24px', marginBottom: '0px'}}> {userInfo?.careerTitle
                    ?.replace(/[{}"]/g, "")?.split(",")?.map(t => t.trim())?.join(" | ")} 
                </p>
                {console.log(userInfo)}
                <p style={{margin: '0px'}}>{userInfo?.location}</p>
            </div>

            <div style={{justifyContent: 'right'}}>
                <p style={{marginTop: '5px'}}>Joined {userInfo?.dateCreated?.split("/")[0] + "/" + userInfo?.dateCreated?.split("/")[2]}</p>
            </div>
            
            
        </div>
    );
};
export default ProfileBox;