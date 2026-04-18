// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar';
import LegacyUI_Tracker from '../components/LegacyUI/Legacy_Plus/LegacyUI_Tracker';
import ModernUI_Tracker from '../components/ModernUI/Modern_Plus/ModernUI_Tracker';
import ModernFooter from '../components/ModernFooter';

function TrackerPage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div className='modernTrackerPageBackground'>
      {localStorage.getItem("legacyMode") === "true" ? <LegacyUI_Tracker /> : <ModernUI_Tracker />}
    </div>
    <ModernFooter />
  </>
}

export default TrackerPage;