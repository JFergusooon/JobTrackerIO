import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ModernNewApplicationPopup = ({text, closePopup, listNames }) => {

    const location = useLocation();
    const [newCompanyName, setNewCompanyName] = useState("");
    const [newJobLink, setNewJobLink] = useState("");
    const [newList, setNewList] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [newPosition, setNewPosition] = useState("");
    const [locationValidationError, setLocationValidationError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");

    const validateLocationFormat = (loc) => {
        if (!loc || loc.trim() === '') return false;
        const normalized = loc.trim().toLowerCase();
        if (normalized === 'remote') return true;
        const locationRegex = /^.+,\s*[a-z]{2}$/i;
        return locationRegex.test(loc);
    };

    const handleLocationChange = (newLoc) => {
        setNewLocation(newLoc);
        if (newLoc.trim() === '') {
            setLocationValidationError('Location is required');
        } else if (!validateLocationFormat(newLoc)) {
            setLocationValidationError('Format: Remote or City, XX (case-insensitive)');
        } else {
            setLocationValidationError('');
        }
    };

    useEffect(() => {
        const listName = new URLSearchParams(location.search).get("listName");
        if (listName) {
            setNewList(listName);
        }
    }, [location.search]);

    const isLocationValid = validateLocationFormat(newLocation);
    const isFormValid = newCompanyName && newPosition && newJobLink && isLocationValid && newList;

    const buildDateAppliedValue = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const microseconds = `${String(now.getMilliseconds()).padStart(3, '0')}000`;

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}`;
    };

    async function addNewApplication() {
        setIsSaving(true);
        setSaveStatus('Saving...');
        console.log('Adding new application' + text)

        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/create" 

        const params = {
            username: localStorage.getItem('username'),
            dateApplied: buildDateAppliedValue(),
            companyName: newCompanyName,
            jobLink: newJobLink || "N/A",
            list: newList,
            location: newLocation || "N/A",
            position: newPosition || "N/A", 
            nextInterviewDate: "",
            notes: "No Notes...",
            rejected: false,
            favorited: false,
            stage: "0"
        };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
            setSaveStatus('Success!');
            setTimeout(() => {
                closePopup();
                window.location.reload();
            }, 1500);
            return;
        } catch (err) {
            console.error("ERROR:", err);
            setSaveStatus('Failed to save. Please try again.');
            setIsSaving(false);
            return;
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999,
        }}>
            <div
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    borderRadius: "16px",
                    padding: "36px 32px 28px",
                    width: "520px",
                    maxWidth: "95vw",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0px",
                    color: "#f0f0f0",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                {/* Title */}
                <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                    Add Job Application
                </h2>

                {/* Subtitle */}
                <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#a0a0a0" }}>
                    Enter the details for the new job application
                </p>

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                    {/* Company Name */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            Company Name *
                        </label>
                        <input
                            placeholder="Enter company name..."
                            value={newCompanyName}
                            onChange={({ target }) => setNewCompanyName(target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #3a3a3c",
                                backgroundColor: "#2c2c2e",
                                color: "#f0f0f0",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            Position *
                        </label>
                        <input
                            placeholder="Enter position..."
                            value={newPosition}
                            onChange={({ target }) => setNewPosition(target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #3a3a3c",
                                backgroundColor: "#2c2c2e",
                                color: "#f0f0f0",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            Location / Remote *
                        </label>
                        <input
                            placeholder="Enter location or 'Remote'..."
                            value={newLocation}
                            onChange={({ target }) => handleLocationChange(target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #3a3a3c",
                                backgroundColor: "#2c2c2e",
                                color: "#f0f0f0",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                        {locationValidationError && (
                            <span style={{
                                fontSize: '12px',
                                color: '#ffffff',
                                backgroundColor: 'rgba(204, 0, 0, 0.2)',
                                border: '1px solid rgba(204, 0, 0, 0.45)',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                marginTop: '6px',
                                display: 'block'
                            }}>
                                {locationValidationError}
                            </span>
                        )}
                    </div>

                    {/* Job Link */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            Job Link *
                        </label>
                        <input
                            placeholder="Enter job link..."
                            value={newJobLink}
                            onChange={({ target }) => setNewJobLink(target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #3a3a3c",
                                backgroundColor: "#2c2c2e",
                                color: "#f0f0f0",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* List Dropdown */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            List *
                        </label>
                        <select
                            value={newList}
                            onChange={(e) => setNewList(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #3a3a3c",
                                backgroundColor: "#2c2c2e",
                                color: "#f0f0f0",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                                cursor: "pointer",
                            }}
                        >
                            <option value="" disabled> Select a list... </option>
                            {listNames?.map((list, index) => (
                                <option key={index} value={list}> {list} </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                {/* Status Message */}
                {saveStatus && (
                    <div style={{ marginBottom: '20px' }}>
                        <span style={{
                            fontSize: '14px',
                            color: saveStatus.includes('Failed') ? '#ff6b6b' : '#00b894',
                            backgroundColor: saveStatus.includes('Failed') ? 'rgba(255, 107, 107, 0.15)' : 'rgba(0, 184, 148, 0.15)',
                            border: saveStatus.includes('Failed') ? '1px solid rgba(255, 107, 107, 0.4)' : '1px solid rgba(0, 184, 148, 0.4)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            display: 'block',
                            textAlign: 'center'
                        }}>
                            {saveStatus}
                        </span>
                    </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "flex-start" }}>
                    <button
                        onClick={closePopup}
                        style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            border: "1px solid #444",
                            backgroundColor: "#2c2c2e",
                            color: "#f0f0f0",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3c"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#2c2c2e"}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={addNewApplication}
                        disabled={!isFormValid || isSaving}
                        style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: isFormValid && !isSaving ? "#4a9eff" : "#3a5080",
                            color: isFormValid && !isSaving ? "#ffffff" : "#7a9aaa",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: isFormValid && !isSaving ? "pointer" : "not-allowed",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            if (isFormValid && !isSaving) e.target.style.backgroundColor = "#3a8eef";
                        }}
                        onMouseLeave={(e) => {
                            if (isFormValid && !isSaving) e.target.style.backgroundColor = "#4a9eff";
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Add Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModernNewApplicationPopup;