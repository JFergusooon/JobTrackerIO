import { useState } from 'react';

const ModernEditApplicationPopup = ({job, listNames, closePopup}) => {

    const [companyName, setCompanyName] = useState(job.companyName);
    const [position, setPosition] = useState(job.position);
    const [location, setLocation] = useState(job.location);
    const [jobLink, setJobLink] = useState(job.jobLink);
    const [list, setList] = useState(job.list);
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
        setLocation(newLoc);
        if (newLoc.trim() === '') {
            setLocationValidationError('Location is required');
        } else if (!validateLocationFormat(newLoc)) {
            setLocationValidationError('Format: Remote or City, XX (case-insensitive)');
        } else {
            setLocationValidationError('');
        }
    };

    const isLocationValid = validateLocationFormat(location);
    const hasChanges =
        (position !== job.position ||
        location !== job.location ||
        jobLink !== job.jobLink ||
        list !== job.list) && isLocationValid;

    const buildPatchBody = () => {
        const body = {};

        if (position !== job.position) body.position = position;
        if (location !== job.location) body.location = location;
        if (jobLink !== job.jobLink) body.jobLink = jobLink;
        if (list !== job.list) body.list = list;

        return body;
    };

    async function editApplication() {
        setIsSaving(true);
        setSaveStatus('Saving...');
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/update?username=" + localStorage.getItem('username') + "&companyName=" + companyName;

        const params = buildPatchBody();

        try {
            const res = await fetch(url, {
                method: "PATCH",
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
        }} onClick={closePopup}>
            <div
                onClick={(e) => e.stopPropagation()}
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
                    Edit Application
                </h2>

                {/* Subtitle */}
                <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#a0a0a0" }}>
                    Update the details for {companyName}
                </p>

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                    {/* Company Name (Read-only) */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            Company Name
                        </label>
                        <input
                            value={companyName}
                            readOnly
                            style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "8px",
                                border: "1px solid #3a3a3c",
                                backgroundColor: "#2c2c2e",
                                color: "#888",
                                fontSize: "14px",
                                outline: "none",
                                boxSizing: "border-box",
                                cursor: "not-allowed",
                            }}
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", display: "block", marginBottom: "8px" }}>
                            Position
                        </label>
                        <input
                            placeholder="Enter position..."
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
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
                            Location / Remote
                        </label>
                        <input
                            placeholder="Enter location or 'Remote'..."
                            value={location}
                            onChange={(e) => handleLocationChange(e.target.value)}
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
                            Job Link
                        </label>
                        <input
                            placeholder="Enter job link..."
                            value={jobLink}
                            onChange={(e) => setJobLink(e.target.value)}
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
                            List
                        </label>
                        <select
                            value={list}
                            onChange={(e) => setList(e.target.value)}
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
                            {listNames?.map((listName, index) => (
                                <option key={index} value={listName}> {listName} </option>
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
                        onClick={editApplication}
                        disabled={!hasChanges || isSaving}
                        style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: hasChanges && !isSaving ? "#4a9eff" : "#3a5080",
                            color: hasChanges && !isSaving ? "#ffffff" : "#7a9aaa",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: hasChanges && !isSaving ? "pointer" : "not-allowed",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            if (hasChanges && !isSaving) e.target.style.backgroundColor = "#3a8eef";
                        }}
                        onMouseLeave={(e) => {
                            if (hasChanges && !isSaving) e.target.style.backgroundColor = "#4a9eff";
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModernEditApplicationPopup;

