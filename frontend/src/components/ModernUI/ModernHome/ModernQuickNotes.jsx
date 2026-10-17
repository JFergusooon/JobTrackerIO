import React, {useEffect, useRef, useState} from 'react';
import '../../../css/Modern_HomePageCSS.css';

const MIN_COLUMN_PERCENT = 45;
const MAX_COLUMN_PERCENT = 100;
const WIDTH_STORAGE_KEY = 'quickNotesWidthPercent';

const readSavedWidth = () => {
    const saved = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    if (!Number.isFinite(saved)) return MIN_COLUMN_PERCENT;
    return Math.min(MAX_COLUMN_PERCENT, Math.max(MIN_COLUMN_PERCENT, saved));
};

const ModernQuickNotes = ({userData}) => {
const containerRef = useRef(null);
const [columnPercent, setColumnPercent] = useState(readSavedWidth);
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

    const handleResizeStart = (event) => {
        event.preventDefault();
        const row = containerRef.current?.closest('.modernQuickSideRow');
        if (!row) return;

        const handle = event.currentTarget;
        handle.setPointerCapture(event.pointerId);
        const rowRect = row.getBoundingClientRect();
        let nextPercent = columnPercent;

        const move = (moveEvent) => {
            const percent = ((rowRect.right - moveEvent.clientX) / rowRect.width) * 100;
            nextPercent = Math.round(Math.min(MAX_COLUMN_PERCENT, Math.max(MIN_COLUMN_PERCENT, percent)));
            setColumnPercent(nextPercent);
        };
        const stop = () => {
            localStorage.setItem(WIDTH_STORAGE_KEY, String(nextPercent));
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
            handle.removeEventListener('pointercancel', stop);
        };

        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    };

    const widthOfSlot = (columnPercent / MIN_COLUMN_PERCENT) * 100;

    return (
        <div
            ref={containerRef}
            className='modernQuickNotesContainer'
            style={{ width: `${widthOfSlot}%`, marginLeft: `${100 - widthOfSlot}%` }}
        >
            <div
                className='modernQuickNotesResizeHandle'
                onPointerDown={handleResizeStart}
                title='Drag to resize'
            />
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