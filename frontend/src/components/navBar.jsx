import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import LoginPopup from '../components/LoginPopup';
import UpdatesPopup from '../components/UpdatesPopup';
import "../css/navBarCSS.css"
import LegacyToggle from './LegacyUI/Legacy_Plus/LegacyToggle.jsx';

function NavBar() { 
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdatesPopup, setShowUpdatesPopup] = useState(false);
  const navigate = useNavigate();
  const togglePopup = () => {
    // If Button is 'Logout':
    if(loginState === "Logout" && localStorage.getItem('username') !== "" && localStorage.getItem('password') !== "") {
            localStorage.setItem('username', '')
            localStorage.setItem('password', '')
            navigate(`/`)
            window.location.reload()
    }
    else {
      setShowPopup(!showPopup);
    }
  }

  const toggleUpdatePopup = () => {
    setShowUpdatesPopup(!showUpdatesPopup);
  }

  let loginState = ""
  loginState = localStorage.getItem('username') !== "" ? "Logout" : "Login";

  return (
    <>
      <nav className="navBarContainer">

  {/* LEFT */}
  <div style={{ flex: 1 }}>
    <Link to="/" style={{ color: 'white', fontSize: '25px' }}>
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
        <div onClick={toggleUpdatePopup} className='loggedInNavBarButton'>
          Updates
        </div>
        <div className='loggedInNavBarButton'>
          Settings
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
      <a href="#" onClick={togglePopup} style={{ color: 'black' }}>
        {loginState}
      </a>
    </div>
  </div>

</nav>


    {/* Show Login/Register Popup if button is clicked */}
    {showPopup ? <LoginPopup text='Login' closePopup={togglePopup} /> : null }

    {showUpdatesPopup ? <UpdatesPopup text='Updates' closePopup={toggleUpdatePopup} /> : null }
    </>
  );
}

export default NavBar;
