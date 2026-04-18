// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar';
import LegacyUI_Tracker from '../components/LegacyUI/Legacy_Plus/LegacyUI_Tracker';
import ModernUI_Tracker from '../components/ModernUI/Modern_Plus/ModernUI_Tracker';
import ModernFooter from '../components/ModernFooter';

function TermsPage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div style={{background: 'linear-gradient(180deg,#9DBF9E 85%, #005157ff 100%)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', marginTop: '30px', height: '100%', flexDirection: 'column', textAlign: 'center'}}>
      
      <div style={{borderBottom: 'solid 1px black'}}>
        <h1>Terms Of Service</h1>
        <p>By using JobTracker, you agree to the following terms and conditions:</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', width: '80%'}}>
        
        {/* Rule 1 */}
        <div style={{display: 'flex', flexDirection: 'row', height: '200px', justifyContent: 'left', alignItems: 'center'}}>
          <div style={{background: 'rgba(255, 255, 255, 0.4)', border: 'solid 1px black', borderRadius: '20px', display: 'flex', flexDirection: 'row'}}>
            <h2 style={{width: '200px'}}>1. User Responsibilities</h2>
            <p style={{width: '500px'}}>You are responsible for maintaining the confidentiality of your account and password, and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.</p>
          </div>
        </div>
        


        {/* Rule 2 */}
        <div style={{display: 'flex', flexDirection: 'row', height: '200px', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{background: 'rgba(255, 255, 255, 0.4)', border: 'solid 1px black', borderRadius: '20px', display: 'flex', flexDirection: 'row'}}>
          <h2 style={{width: '200px'}}>2. Data Usage</h2>
          <p  style={{width: '500px'}}>JobTracker collects and uses your data to provide and improve our services. We do not sell your personal information to third parties. For more details, please refer to our Privacy Policy.</p>
        </div>
          

        </div>
        


      {/* Rule 3 */}
        <div style={{display: 'flex', flexDirection: 'row', height: '200px', justifyContent: 'right', alignItems: 'center'}}>
          <div style={{background: 'rgba(255, 255, 255, 0.4)', border: 'solid 1px black', borderRadius: '20px', display: 'flex', flexDirection: 'row'}}>
            <h2 style={{width: '200px'}}>3. Prohibited Activities</h2>
            <p style={{width: '500px'}}>You agree not to use JobTracker for any unlawful purpose or in any way that could damage, disable, overburden, or impair our services. This includes, but is not limited to, using our services to harass, abuse, or harm others.</p>
          </div>
        </div>
      </div>
      
    </div>
    <ModernFooter />
  </>
}

export default TermsPage;