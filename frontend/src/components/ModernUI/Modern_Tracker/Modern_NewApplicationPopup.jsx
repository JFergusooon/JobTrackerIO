import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Modern_NewApplicationPopup = ({text, closePopup, listNames }) => {

    const location = useLocation();
    const [newCompanyName, setNewCompanyName] = useState("");
    const [newJobLink, setNewJobLink] = useState("");
    const [newList, setNewList] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [newPosition, setNewPosition] = useState("");

    useEffect(() => {
        const listName = new URLSearchParams(location.search).get("listName");
        if (listName) {
            setNewList(listName);
        }
    }, [location.search]);

    const isFormValid = newCompanyName && newPosition && newJobLink && newLocation && newList;

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
        } catch (err) {
            console.error("ERROR:", err);
        }

        closePopup()
        window.location.reload()
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
                            onChange={({ target }) => setNewLocation(target.value)}
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
                        disabled={!isFormValid}
                        style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: isFormValid ? "#4a9eff" : "#3a5080",
                            color: isFormValid ? "#ffffff" : "#7a9aaa",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: isFormValid ? "pointer" : "not-allowed",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            if (isFormValid) e.target.style.backgroundColor = "#3a8eef";
                        }}
                        onMouseLeave={(e) => {
                            if (isFormValid) e.target.style.backgroundColor = "#4a9eff";
                        }}
                    >
                        Add Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modern_NewApplicationPopup;