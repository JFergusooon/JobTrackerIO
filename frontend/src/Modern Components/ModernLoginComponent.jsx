import React, { useEffect } from "react";

export default function ModernLoginComponent({ open, onClose }) {
  // Hooks must be called on every render — so call useEffect unconditionally.
  useEffect(() => {
    if (!open) return; // do nothing when popup is closed

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null; // safe early return after hooks

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "350px",
          background: "white",
          padding: "25px",
          borderRadius: "15px",
          position: "relative",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            border: "none",
            background: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0 }}>Login</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Username"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#3F5EFB",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Log In
          </button>

          <p style={{padding: '0px', margin: '0px'}}> Dont have an account? <button style={{padding: '0px', margin: '0px', color: '#3F5EFB'}}>Register</button></p>
          
        </div>
      </div>
    </div>
  );
}
