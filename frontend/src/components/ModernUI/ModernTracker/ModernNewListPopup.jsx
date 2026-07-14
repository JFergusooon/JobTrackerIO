import { useState } from 'react';

const ModernNewListPopup = ({text, closePopup}) => {

    const [newListName, setNewListName] = useState("");
    const canCreateList = newListName.trim() !== "";

    async function addNewList() {
        const normalizedListName = newListName.trim();

        if (!normalizedListName) {
            return;
        }

        console.log('Adding new list with ' + normalizedListName)


        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Users/updateListNames" 
                     + "?username=" + localStorage.getItem('username')
                     + "&newListName=" + encodeURIComponent(normalizedListName);


        try {
            const res = await fetch(url, {
                method: "PATCH"
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
        } catch (err) {
            console.error("ERROR:", err);
        }

        closePopup();
        window.location.assign("/tracker?listName=" + encodeURIComponent(normalizedListName));
    }


    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    borderRadius: "16px",
                    padding: "32px 28px 24px",
                    width: "460px",
                    maxWidth: "95vw",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    color: "#f0f0f0",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                <h2 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                    Create New List
                </h2>

                <p style={{ margin: "0 0 18px", fontSize: "14px", color: "#a0a0a0" }}>
                    Enter a name for your new tracking list.
                </p>

                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 18px" }} />

                <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    List Name
                </label>
                <input
                    value={newListName}
                    placeholder="New list name"
                    onChange={({ target }) => setNewListName(target.value)}
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
                        marginBottom: "20px",
                    }}
                />

                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 18px" }} />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
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
                    <button
                        onClick={addNewList}
                        disabled={!canCreateList}
                        style={{
                            padding: "10px 22px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: canCreateList ? "#4a9eff" : "#3a5080",
                            color: canCreateList ? "#ffffff" : "#7a9aaa",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: canCreateList ? "pointer" : "not-allowed",
                        }}
                    >
                        Create List
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ModernNewListPopup;