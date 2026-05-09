import { useState } from 'react';

const Modern_DeletePopup_v2 = ({ func, companyOrListName, closePopup }) => {

    const [enteredPassword, setEnteredPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isCorrect = enteredPassword === "1234";
    const hasTyped = enteredPassword.length > 0;

    async function deleteCompany() {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/deleteJob"
            + "?username=" + localStorage.getItem('username')
            + "&companyName=" + companyOrListName;
        try {
            const res = await fetch(url, { method: "DELETE" });
            const data = await res.json();
            console.log("SUCCESS:", data);
        } catch (err) {
            console.error("ERROR:", err);
        }
        window.location.reload();
    }

    async function removeListFromUser() {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Users/removeList"
            + "?username=" + localStorage.getItem('username')
            + "&existingListName=" + companyOrListName;
        try {
            const res = await fetch(url, { method: "PATCH" });
            const data = await res.json();
            console.log("SUCCESS:", data);
            window.location.href = "/tracker";
        } catch (err) {
            console.error("ERROR:", err);
        }
    }

    async function removeJobsWithList() {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/deleteJobByListName"
            + "?username=" + localStorage.getItem('username')
            + "&listName=" + companyOrListName;
        try {
            const res = await fetch(url, { method: "DELETE" });
            const data = await res.json();
            console.log("SUCCESS:", data);
            window.location.href = "/tracker";
            window.location.reload();
        } catch (err) {
            console.error("ERROR:", err);
        }
    }

    async function deleteList() {
        removeListFromUser();
        removeJobsWithList();
    }

    const handleDelete = func === "company" ? deleteCompany : deleteList;

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
                    width: "480px",
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
                <h2 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                    Delete {companyOrListName}
                </h2>

                {/* Subtitle */}
                <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#a0a0a0" }}>
                    Permanently delete this {func === "company" ? "job application" : "list"} and all of its data.
                </p>
                

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                {/* Confirmation prompt */}
                <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#a0a0a0" }}>
                    To confirm, please enter your password below.
                </p>

                {/* Password label */}
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#f0f0f0", marginBottom: "8px" }}>
                    Password
                </label>

                {/* Password input */}
                <div style={{ position: "relative", marginBottom: hasTyped && !isCorrect ? "6px" : "20px" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={enteredPassword}
                        onChange={({ target }) => setEnteredPassword(target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 44px 12px 14px",
                            borderRadius: "8px",
                            border: hasTyped && !isCorrect ? "1px solid #e05252" : "1px solid #3a3a3c",
                            backgroundColor: "#2c2c2e",
                            color: "#f0f0f0",
                            fontSize: "15px",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        style={{
                            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "18px",
                            display: "flex", alignItems: "center",
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Inline error */}
                {hasTyped && !isCorrect && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e05252", fontSize: "13px", marginBottom: "20px" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Password is incorrect.
                    </div>
                )}

                {/* Warning box */}
                <div style={{
                    border: "1px solid #7d2828",
                    backgroundColor: "#2a1010",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: "24px",
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e05252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <div>
                        <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#e05252", fontSize: "14px" }}>
                            This action cannot be undone.
                        </p>
                        <p style={{ margin: 0, color: "#c0c0c0", fontSize: "13px", lineHeight: "1.5" }}>
                            All associated data, including application details and notes, will be permanently deleted.
                        </p>
                    </div>
                </div>

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
                        }}
                    >
                        Cancel
                    </button>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <button
                            onClick={handleDelete}
                            disabled={!isCorrect}
                            style={{
                                padding: "10px 22px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: isCorrect ? "#8b1f1f" : "#4a2020",
                                color: isCorrect ? "#ffffff" : "#7a4a4a",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: isCorrect ? "pointer" : "not-allowed",
                                transition: "background-color 0.2s",
                            }}
                        >
                            Delete {func === "company" ? "Application" : "List"}
                        </button>
                        {!isCorrect && (
                            <p style={{ margin: 0, fontSize: "11px", color: "#666", textAlign: "right" }}>
                                The Delete button will remain disabled until the correct password is entered.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modern_DeletePopup_v2;