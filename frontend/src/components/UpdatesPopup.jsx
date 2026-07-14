import '../css/ModernLoginCSS.css';

const UpdatesPopup = ({ text, closePopup }) => {
    const updates = [
        {
            category: "Modern UI Launch",
            items: [
                "Completely redesigned interface with improved usability",
                "New color scheme and typography",
                "Enhanced responsive design"
            ]
        },
        {
            category: "Home Screen",
            items: [
                "Redesigned Profile Box with cleaner layout",
                "Stats Chart now displays data from last 6 months",
                "Quick Notes section for easy access",
                "Recent Lists widget for faster navigation"
            ]
        },
        {
            category: "Tracker",
            items: [
                "Improved job application management",
                "Enhanced sorting and filtering options",
                "Better delete confirmations with safety warnings"
            ]
        }
    ];

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
                    maxHeight: "75vh",
                    overflowY: "auto",
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
                    Updates
                </h2>

                {/* Subtitle */}
                <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#a0a0a0" }}>
                    Here's what's new in JobTracker
                </p>

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                {/* Updates List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                    {updates.map((section, idx) => (
                        <div key={idx}>
                            <h3 style={{
                                margin: "0 0 10px",
                                fontSize: "15px",
                                fontWeight: "700",
                                color: "#ffffff",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                {section.category}
                            </h3>
                            <ul style={{
                                margin: 0,
                                paddingLeft: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px"
                            }}>
                                {section.items.map((item, itemIdx) => (
                                    <li key={itemIdx} style={{
                                        fontSize: "13px",
                                        color: "#c0c0c0",
                                        lineHeight: "1.5"
                                    }}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 20px" }} />

                {/* Close Button */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
export default UpdatesPopup;