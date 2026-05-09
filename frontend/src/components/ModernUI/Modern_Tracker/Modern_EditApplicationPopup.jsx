import { useState } from 'react';

const Modern_EditApplicationPopup = ({job, listNames, closePopup}) => {

    const [companyName, setCompanyName] = useState(job.companyName);
    const [position, setPosition] = useState(job.position);
    const [location, setLocation] = useState(job.location);
    const [jobLink, setJobLink] = useState(job.jobLink);
    const [list, setList] = useState(job.list);

    const hasChanges =
        position !== job.position ||
        location !== job.location ||
        jobLink !== job.jobLink ||
        list !== job.list;

    const buildPatchBody = () => {
        const body = {};

        if (position !== job.position) body.position = position;
        if (location !== job.location) body.location = location;
        if (jobLink !== job.jobLink) body.jobLink = jobLink;
        if (list !== job.list) body.list = list;

        return body;
    };

    async function editApplication() {
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
        } catch (err) {
            console.error("ERROR:", err);
        }

        closePopup();
        window.location.reload();
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
                            onChange={(e) => setLocation(e.target.value)}
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
                        disabled={!hasChanges}
                        style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: hasChanges ? "#4a9eff" : "#3a5080",
                            color: hasChanges ? "#ffffff" : "#7a9aaa",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: hasChanges ? "pointer" : "not-allowed",
                            transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            if (hasChanges) e.target.style.backgroundColor = "#3a8eef";
                        }}
                        onMouseLeave={(e) => {
                            if (hasChanges) e.target.style.backgroundColor = "#4a9eff";
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modern_EditApplicationPopup;

