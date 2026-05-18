import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import LoginPopup from '../components/LoginPopup';
import "../css/navBarCSS.css"

function NavBar() { 
  const [showPopup, setShowPopup] = useState(false);
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = () => forceUpdate(n => n + 1);
    window.addEventListener('authChange', handleAuth);
    return () => window.removeEventListener('authChange', handleAuth);
  }, []);
  const togglePopup = () => {
    // If Button is 'Logout':
    if(loginState === "Logout" && localStorage.getItem('username') !== "" && localStorage.getItem('password') !== "") {
            localStorage.setItem('username', '')
            localStorage.setItem('password', '')
            navigate('/')
            window.dispatchEvent(new Event('authChange'))
    }
    else {
      setShowPopup(!showPopup);
    }
  }

  let loginState = ""
  loginState = localStorage.getItem('username') !== "" ? "Logout" : "Login";

  return (
    <>
      <nav className="navBarContainer">

  {/* LEFT */}
  <div style={{ flex: 1 }}>
    <Link to="/" style={{ color: 'white', fontSize: '25px', position: 'relative', left: '-125px' }}>
      job-tracker.io
    </Link>
  </div>

  {/* CENTER (always centered) */}
  <div style={{
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '20px'
  }}>
    {localStorage.getItem("username") !== "" && (
      <>
        <div className='loggedInNavBarButton' onClick={() => navigate('/')}>
          <Link to="/">Home</Link>
        </div>
        <div className='loggedInNavBarButton' onClick={() => navigate('/tracker')}>
          <Link to="/tracker">Tracker</Link>
        </div>
        <div className='loggedInNavBarButton' onClick={() => navigate('/settings')}>
          <Link to="/settings">Settings</Link>
        </div>
      </>
    )}
  </div>

  {/* RIGHT */}
  <div style={{
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '20px'
  }}>
    {localStorage.getItem("username") !== "" && (
      <p style={{ color: 'white', margin: 0 }}>
        Hi, {localStorage.getItem("username")}!
      </p>
    )}

    <div className='loginStateButton'>
      <div onClick={togglePopup} style={{ color: 'black', cursor: 'pointer' }}>
        {loginState}
      </div>
    </div>
  </div>

</nav>


    {/* Show Login/Register Popup if button is clicked */}
    {showPopup ? <LoginPopup text='Login' closePopup={togglePopup} /> : null }
    </>
  );
}

export default NavBar;
