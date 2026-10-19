import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import '../../../css/Modern_HomePageCSS.css';

const MIN_NOTES_WIDTH = 200;
const WIDTH_STORAGE_KEY = 'quickNotesWidthPercent';

const readSavedWidth = () => {
    const saved = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    if (!Number.isFinite(saved)) return 0.45;
    const fraction = saved > 1 ? saved / 100 : saved;
    return Math.min(1, Math.max(0, fraction));
};

const ModernQuickNotes = ({userData}) => {
const containerRef = useRef(null);
const [rowFraction, setRowFraction] = useState(readSavedWidth);
const [measures, setMeasures] = useState({ row: 0, slot: 0 });
const [quickNotes, setQuickNotes] = useState("");

    useLayoutEffect(() => {
        const notes = containerRef.current;
        const row = notes?.closest('.modernQuickSideRow');
        const slot = notes?.parentElement;
        if (!row || !slot) return undefined;

        let frame = 0;
        const update = () => {
            const nextRow = Math.round(row.getBoundingClientRect().width);
            const nextSlot = Math.round(slot.getBoundingClientRect().width);
            setMeasures((current) => (
                current.row === nextRow && current.slot === nextSlot
                    ? current
                    : { row: nextRow, slot: nextSlot }
            ));
        };

        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(update);
        };

        schedule();
        const observer = new ResizeObserver(schedule);
        observer.observe(row);
        observer.observe(slot);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);

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
        const notes = containerRef.current;
        const row = notes?.closest('.modernQuickSideRow');
        const slot = notes?.parentElement;
        if (!notes || !row || !slot) return;

        const handle = event.currentTarget;
        handle.setPointerCapture(event.pointerId);
        const startX = event.clientX;
        const startWidth = notes.getBoundingClientRect().width;
        let nextFraction = rowFraction;

        const move = (moveEvent) => {
            const rowWidth = row.getBoundingClientRect().width;
            const slotWidth = slot.getBoundingClientRect().width;
            if (rowWidth <= 0) return;

            const nextWidth = startWidth + (startX - moveEvent.clientX);
            const minWidth = Math.max(MIN_NOTES_WIDTH, slotWidth);
            const clamped = Math.min(rowWidth, Math.max(minWidth, nextWidth));
            nextFraction = clamped / rowWidth;
            setRowFraction(nextFraction);
        };
        const stop = () => {
            localStorage.setItem(WIDTH_STORAGE_KEY, String(nextFraction));
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
            handle.removeEventListener('pointercancel', stop);
        };

        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    };

    let widthOfSlot = 100;
    let marginLeft = 0;
    if (measures.row > 0 && measures.slot > 0) {
        const desired = Math.min(
            measures.row,
            Math.max(measures.slot, Math.max(MIN_NOTES_WIDTH, rowFraction * measures.row))
        );
        widthOfSlot = (desired / measures.slot) * 100;
        marginLeft = 100 - widthOfSlot;
    }

    return (
        <div
            ref={containerRef}
            className='modernQuickNotesContainer'
            style={{ width: `${widthOfSlot}%`, marginLeft: `${marginLeft}%` }}
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