import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';

const Modern_RecentLists = ({text, closePopup}) => {

    //fetch all Job lists
    const [jobLists, setJobLists] = useState([]);

    {/*      /Users/getListNamesByUsername     */}
    
    const fetchAllListNames = async () => {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Users/getListNamesByUsername?username=${localStorage.getItem("username")}`;
        const encode = window.btoa("admin:admin");

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': 'Basic ' + encode },
                method: "GET"
            });

            const data = await res.json();
            setJobLists(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAllListNames();
    }, []);

    //const lists = jobLists || [];

    //const recentLists = lists
    //    .slice(-12)     // last 12
    //    .reverse();     // newest first


    return (
        <div className='modernRecentListsContainer'>
            <p className='modernRecentListsTitle'> Recent Lists </p>
            <div className='modernRecentListsButtonContainer'>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #1</div>
                    <div className='modernRecentListsButton'>List #2</div>
                    <div className='modernRecentListsButton'>List #3</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #4</div>
                    <div className='modernRecentListsButton'>List #5</div>
                    <div className='modernRecentListsButton'>List #6</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #7</div>
                    <div className='modernRecentListsButton'>List #8</div>
                    <div className='modernRecentListsButton'>List #9</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #10</div>
                    <div className='modernRecentListsButton'>List #11</div>
                    <div className='modernRecentListsButton'>List #12</div>
                </div>

                {/*<div className='modernRecentListsGrid'>
                {recentLists.map((list, index) => (
                    <div key={index} className='modernRecentListsButton'>
                        {list}
                    </div>
                ))}
                </div>*/}
            </div>

            
        </div>



            



        
    );
};
export default Modern_RecentLists;