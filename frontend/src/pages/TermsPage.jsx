// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar';
import ModernFooter from '../components/ModernFooter';

function TermsPage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div style={{
      minHeight: 'calc(100vh - 75px)',
      background: 'var(--page-gradient)',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: '30px',
      flexDirection: 'column',
      textAlign: 'center',
      boxSizing: 'border-box',
      paddingTop: '40px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{borderBottom: 'solid 1px black'}}>
          <h1>Terms Of Service</h1>
          <p>By using JobTracker, you agree to the following terms and conditions:</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: 'min(720px, 90%)',
          marginTop: '24px',
          textAlign: 'left'
        }}>
          {[
            {
              number: '1',
              title: 'User Responsibilities',
              body: 'You are responsible for maintaining the confidentiality of your account and password, and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.'
            },
            {
              number: '2',
              title: 'Data Usage',
              body: 'JobTracker collects and uses your data to provide and improve our services. We do not sell your personal information to third parties. For more details, please refer to our Privacy Policy.'
            },
            {
              number: '3',
              title: 'Prohibited Activities',
              body: 'You agree not to use JobTracker for any unlawful purpose or in any way that could damage, disable, overburden, or impair our services. This includes, but is not limited to, using our services to harass, abuse, or harm others.'
            }
          ].map((rule) => (
            <div
              key={rule.number}
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: 'solid 1px black',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '18px',
                padding: '20px 24px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: '1px solid black',
                background: 'rgba(255, 255, 255, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                color: '#000'
              }}>
                {rule.number}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#000'
                }}>
                  {rule.title}
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: 1.55,
                  color: '#222'
                }}>
                  {rule.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <ModernFooter />
  </>
}

export default TermsPage;