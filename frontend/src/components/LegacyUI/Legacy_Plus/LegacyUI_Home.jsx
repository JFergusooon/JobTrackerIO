import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../../../css/Legacy_HomePageCSS.css'
import ProfileBox from '../Legacy_Home/Legacy_ProfileBox';
import QuickSettings from '../Legacy_Home/Legacy_QuickSettings';
import QuickNotes from '../Legacy_Home/Legacy_QuickNotes';
import ImportantJobs from '../Legacy_Home/Legacy_ImportantJobs';
import RecentLists from '../Legacy_Home/Legacy_RecentLists';
import StatsChart from '../Legacy_Home/Legacy_StatsChart';
import StatsInfo from '../Legacy_Home/Legacy_StatsInfo'
import ModernFooterComponent from '../../ModernFooter.jsx';
import LegacyToggle from './LegacyToggle.jsx';

function ModernUI_Home() { 


    return (
        <div className='homeContainer'>
            
          {/* Left Column */}
          <div style={{display: 'flex', flexDirection: 'column', 
                    gap: '10px',
                    background: 'green', padding: '5px'
          }}>
            <ProfileBox />
            
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{width: '55%'}}>
              </div>
              <div style={{width: '45%', height: '100%'}}>
                  <QuickSettings />
                  <QuickNotes />
              </div>
            </div>
            
          </div>
          
          {/* Middle Column */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '30px', width: '100%',
            background: '#b80e0e'
          }}>
            <ImportantJobs />
            <RecentLists />
          </div>

          {/* Right Column */} 
          <div style={{display: 'flex', flexDirection: 'column', width: '100%', background: 'gray'}}>
            <StatsChart />
            <StatsInfo />
          </div>
        </div>
    );
};

export default ModernUI_Home;