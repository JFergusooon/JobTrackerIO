import React, {useEffect, useState} from 'react';
import '../../../css/Modern_HomePageCSS.css';

const ModernQuickNotes = ({userData}) => {

const [quickNotes, setQuickNotes] = useState("");

    useEffect(() => {
    if (userData?.quickNotes !== undefined) {
        setQuickNotes(userData.quickNotes);
    }
    }, [userData]);


    const updateQuickNotes = async (value) => {
    try {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Users/updateQuickNotes`;

        await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + window.btoa("admin:admin")
            },
            body: JSON.stringify({
                username: localStorage.getItem("username"),
                quickNotes: value
            })
        });
    } catch (err) {
        console.error(err);
    }
};

    return (
        <div className='modernQuickNotesContainer'>
            <p className='modernQuickNotesTitle'> Quick Notes </p>
            <textarea
    className='modernQuickNotesInput'
    rows={1}
    value={quickNotes}
    onChange={(e) => {
        const newValue = e.target.value;
        setQuickNotes(newValue);
        updateQuickNotes(newValue);
    }}
/>
        </div>
    );
};
export default ModernQuickNotes;