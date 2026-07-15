// pages/TrackerPage.jsx
import React from 'react';
import NavBar from '../components/navBar';
import ModernUITracker from '../components/ModernUI/ModernPlus/ModernUITracker';
import ModernFooter from '../components/ModernFooter';

function TrackerPage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div className='modernTrackerPageShell'>
      <ModernUITracker />
    </div>
    <ModernFooter />
  </>
}

export default TrackerPage;
