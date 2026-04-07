import React, { useEffect } from "react";
import '../css/ModernLoginCSS.css';

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

  const handleRegisterClick = () => {
    console.log("Register clicked");
    // you can use props or state here

  };


  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", 
                justifyContent: "center", alignItems: "center", zIndex: 9999 }}>


      <div onClick={(e) => e.stopPropagation()} className='loginFormContainer'>
        <button onClick={onClose} className='loginCloseButton'> × </button>

        <h2 style={{ marginTop: 0 }}>Login</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="text" placeholder="Username" className="loginFormTextBox"/>
          <input type="password" placeholder="Password" className="loginFormTextBox"/>

          <button className="loginSubmitButton"> Log In </button>

          <p style={{padding: '0px', margin: '0px'}}> Dont have an account? 
            <button style={{padding: '0px', margin: '0px', color: '#3F5EFB'}}
                    onClick={{}}>Register</button>
          </p>
          
        </div>
      </div>
    </div>
  );
}
