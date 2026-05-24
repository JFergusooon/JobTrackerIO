// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar';
import LegacyUITracker from '../components/LegacyUI/Legacy_Plus/LegacyUI_Tracker';
import ModernUITracker from '../components/ModernUI/ModernPlus/ModernUITracker';
import ModernFooter from '../components/ModernFooter';

function TrackerPage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div className='modernTrackerPageBackground'>
      {localStorage.getItem("legacyMode") === "true" ? <LegacyUITracker /> : <ModernUITracker />}
    </div>
    <ModernFooter />
  </>
}

export default TrackerPage;