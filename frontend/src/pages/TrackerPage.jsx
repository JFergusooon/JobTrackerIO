// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar';
import LegacyUI from '../components/LegacyUI';

function TrackerPage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(180deg,#9DBF9E 85%, #005157ff 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

      {localStorage.getItem("legacyMode") === "true" ? <LegacyUI /> : 
        <>
          <p>Non-Legacy UI still in progress...</p>
        </>
      }


  
</div>
  </>
}


export default TrackerPage;