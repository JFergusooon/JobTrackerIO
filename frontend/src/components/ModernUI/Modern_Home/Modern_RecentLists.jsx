import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';
import { useNavigate } from 'react-router-dom';

const Modern_RecentLists = ({ text, closePopup }) => {
    const [jobLists, setJobLists] = useState([]);

    const fetchAllListNames = async () => {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Users/getListNamesByUsername?username=${localStorage.getItem("username")}`;
        const encode = window.btoa("admin:admin");

        try {
            const res = await fetch(url, {
                headers: { Authorization: 'Basic ' + encode },
                method: "GET"
            });

            const data = await res.json();
            setJobLists(data.listNames);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAllListNames();
    }, []);

    const lists = jobLists || [];

    // ----- NEW LOGIC -----
    const recentLists = lists.slice(-12).reverse();

    while (recentLists.length < 12) {
        recentLists.push("...");
    }

    const finalLists = recentLists.map(name => ({
        name,
        disabled: name === "..."
    }));
    // ----------------------

    const navigate = useNavigate();

    const handleListClick = (listName) => {
        if (listName === "No List Here") return;
        navigate(`/Tracker?listName=${encodeURIComponent(listName)}`);
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className='modernRecentListsContainer'>
            <p className='modernRecentListsTitle'> Recent Lists </p>

            <div className='modernRecentListsButtonContainer'>
                {Array.from({ length: 4 }).map((_, colIndex) => (
                    <div key={colIndex} style={{ display: 'flex', flexDirection: 'column' }}>
                        {Array.from({ length: 3 }).map((_, rowIndex) => {
                            const item = finalLists[rowIndex * 4 + colIndex];

                            return (
                                <div key={rowIndex} className='modernRecentListsButton'
                                    style={{ opacity: item?.disabled ? 0.4 : 1,
                                            pointerEvents: item?.disabled ? 'none' : 'auto'}}
                                    onClick={() => handleListClick(item?.name)}>
                                    {item?.name || "..."}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Modern_RecentLists;