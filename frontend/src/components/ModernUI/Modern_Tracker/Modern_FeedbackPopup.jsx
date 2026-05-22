import { useState } from 'react';
import emailjs from '@emailjs/browser';

const Modern_FeedbackPopup = ({ closePopup }) => {

    const EMAILJS_SERVICE_ID = "service_azocgg9";
    const EMAILJS_TEMPLATE_ID = "template_r6iefxs";
    const EMAILJS_PUBLIC_KEY = "031phQOO8bcKWzLhr";

    const [feedbackType, setFeedbackType] = useState("General");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const canSubmit = message.trim() !== "" && !submitting;

    async function submitFeedback() {
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        const templateParams = {
            feedbackType,
            feedbackMessage: message.trim(),
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
            setSubmitted(true);
        } catch (err) {
            console.error("Feedback submission error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
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
            onClick={closePopup}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    borderRadius: "16px",
                    padding: "32px 28px 24px",
                    width: "480px",
                    maxWidth: "95vw",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    color: "#f0f0f0",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                {submitted ? (
                    <>
                        <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                            Thank You!
                        </h2>
                        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#a0a0a0" }}>
                            Your feedback has been received. We appreciate you taking the time to help improve JobTracker.
                        </p>
                        <button
                            onClick={closePopup}
                            style={{
                                alignSelf: "flex-end",
                                backgroundColor: "#4CAF50",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 24px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </>
                ) : (
                    <>
                        <h2 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: "700", color: "#ffffff" }}>
                            Send Feedback
                        </h2>
                        <p style={{ margin: "0 0 18px", fontSize: "14px", color: "#a0a0a0" }}>
                            We'd love to hear what's working or what could be improved.
                        </p>

                        <hr style={{ border: "none", borderTop: "1px solid #333", margin: "0 0 18px" }} />

                        <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                            Feedback Type
                        </label>
                        <select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            style={{
                                backgroundColor: "#1a1a1a",
                                color: "#f0f0f0",
                                border: "1px solid #444",
                                borderRadius: "8px",
                                padding: "9px 12px",
                                fontSize: "14px",
                                marginBottom: "16px",
                                outline: "none",
                                cursor: "pointer",
                            }}
                        >
                            <option value="General">General</option>
                            <option value="Bug Report">Bug Report</option>
                            <option value="Feature Request">Feature Request</option>
                        </select>

                        <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your feedback..."
                            rows={5}
                            style={{
                                backgroundColor: "#1a1a1a",
                                color: "#f0f0f0",
                                border: "1px solid #444",
                                borderRadius: "8px",
                                padding: "10px 12px",
                                fontSize: "14px",
                                resize: "vertical",
                                outline: "none",
                                fontFamily: "inherit",
                                marginBottom: "16px",
                            }}
                        />

                        {error && (
                            <p style={{ color: "#ff6b6b", fontSize: "13px", margin: "0 0 12px" }}>
                                {error}
                            </p>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                onClick={closePopup}
                                style={{
                                    backgroundColor: "transparent",
                                    color: "#a0a0a0",
                                    border: "1px solid #444",
                                    borderRadius: "8px",
                                    padding: "10px 20px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitFeedback}
                                disabled={!canSubmit}
                                style={{
                                    backgroundColor: canSubmit ? "#4CAF50" : "#2e5c30",
                                    color: canSubmit ? "#fff" : "#888",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 24px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: canSubmit ? "pointer" : "not-allowed",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Modern_FeedbackPopup;
