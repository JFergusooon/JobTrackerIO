import { Link } from 'react-router-dom';
import { useState } from "react";
import ModernLoginComponent from '../Modern Components/ModernLoginComponent';

function NavBar() { 
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
    <nav 
      style={{
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#005157ff',
        padding: '10px 20px',
        height: '45px',           // Increased height for safe spacing
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}
    >

      {/* Left Title */}
      <Link to="/" style={{ color: 'white', fontSize: '25px', margin: 0 }}>
        job-tracker.io
      </Link>

      {/* Right Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div
            className='navBarButton'
            onClick={() => setLoginOpen(true)}
          > Login </div>
      </div>

    </nav>

      

      <ModernLoginComponent open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default NavBar;
