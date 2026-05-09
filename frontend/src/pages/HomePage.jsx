// pages/Home.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import NavBar from '../components/navBar.jsx';
import LegacyUI_Home from '../components/LegacyUI/Legacy_Plus/LegacyUI_Home.jsx';
import ModernUI_Home from '../components/ModernUI/Modern_Plus/ModernUI_Home.jsx';
import ModernFooterComponent from '../components/ModernFooter.jsx'
import UpdatesPopup from '../components/UpdatesPopup';


function HomePage() {
  const [showUpdatesPopup, setShowUpdatesPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('username') !== '');

  useEffect(() => {
    const handleLogin = () => setIsLoggedIn(localStorage.getItem('username') !== '');
    window.addEventListener('authChange', handleLogin);
    return () => window.removeEventListener('authChange', handleLogin);
  }, []);

  const toggleUpdatePopup = () => {
    setShowUpdatesPopup(!showUpdatesPopup);
  };

  const updatesData = [
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

  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div
      style={{
        minHeight: 'calc(100vh - 75px)',
        background: 'linear-gradient(180deg, #9DBF9E 85%, #005157ff 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', 
        marginTop: '30px'
      }}>

      {isLoggedIn ? 
        <>
          {localStorage.getItem('legacyMode') === "true" ? (
            <LegacyUI_Home onOpenUpdates={toggleUpdatePopup} />
          ) : (
            <ModernUI_Home onOpenUpdates={toggleUpdatePopup} />
          )}
        </>
            : 
        <>
          {/* Box that holds update boxes */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', 
              alignItems: 'stretch', gap: '30px', padding: '20px', borderRadius: '10px'}}>

            {/* Left Side Grey Box */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', width: '520px', minHeight: '520px', maxWidth: '95vw', maxHeight: '75vh', borderRadius: '16px', padding: '32px', boxSizing: 'border-box', color: '#000000', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', border: '0.1px solid black'}}>
              <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#000000" }}>Why Join JobTracker?</h2>
              <p style={{ color: '#333333', margin: '0px', fontSize: '14px' }}>JobTracker offers easy application tracking abilities for job seekers looking to land that next step in their career journey.</p>
              <p style={{ color: '#333333', margin: '0px', fontSize: '14px' }}>We are here to help!</p>
              <hr style={{ border: "none", borderTop: "1px solid rgba(0, 0, 0, 0.2)", margin: "0" }} />
              <ul style={{ paddingLeft: '20px', margin: '0px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ fontSize: '13px', color: '#555555', lineHeight: '1.5' }}>Create Lists to separate applications</li>
                <li style={{ fontSize: '13px', color: '#555555', lineHeight: '1.5' }}>Track Rejection Status</li>
              </ul>
              <p style={{padding: '0px', margin: '8px 0 0 0', fontSize: '14px', color: '#333333'}}>Create an Account or Log In to get Started!</p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto'}}>
                <h3 style={{height: 'auto', padding: '0px', margin: '0px', fontSize: '13px', fontWeight: '600', color: '#000000'}}>
                  Also enjoy a Windows application version
                </h3>
                <a href='/github' style={{padding: '0px', color: '#4a9eff', textDecoration: 'none', fontSize: '13px'}}> Download Link </a>
              </div>
            </div>

      {/* Right Side Grey Box */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', width: '520px', minHeight: '520px', maxWidth: '95vw', maxHeight: '75vh', borderRadius: '20px', padding: '32px', boxSizing: 'border-box', color: '#000000', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', border: '0.1px solid black'}}>
        <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "700", color: "#000000" }}>
          Updates
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#333333" }}>
          Here's what's new in JobTracker
        </p>
        <hr style={{ border: "none", borderTop: "1px solid rgba(0, 0, 0, 0.2)", margin: "0 0 20px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {updatesData.map((section, idx) => (
            <div key={idx}>
              <h3 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "700", color: "#000000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {section.category}
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={{ fontSize: "13px", color: "#555555", lineHeight: "1.5" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

          </div>
        </>
      }


  
    </div>
    <ModernFooterComponent />
    {showUpdatesPopup ? <UpdatesPopup text='Updates' closePopup={toggleUpdatePopup} /> : null }
  </>
}


export default HomePage;