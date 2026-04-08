import { Link } from 'react-router-dom';
import { useState } from "react";
import LoginPopup from '../components/LoginPopup';
import UpdatesPopup from '../components/UpdatesPopup';
import "../css/navBarCSS.css"
import LegacyToggle from './LegacyToggle';
{/*import ModernLoginComponent from '../Modern Components/ModernLoginComponent';*/}

const port = 3000;
const full = "http://localhost:" + port + "/"

function NavBar() { 
  {/* const [loginOpen, setLoginOpen] = useState(false); */}
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdatesPopup, setShowUpdatesPopup] = useState(false);
  const togglePopup = () => {
    // If Button is 'Logout':
    if(loginState === "Logout" && localStorage.getItem('username') !== "" && localStorage.getItem('password') !== "") {
            localStorage.setItem('username', '')
            localStorage.setItem('password', '')
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

        {/* Left Title */}
        <Link to="/" style={{ color: 'white', fontSize: '25px', margin: 0 }}> job-tracker.io </Link>

        <div className="menu-item is-active menu-item--play">
          <a href="#" className="menu-link" onClick={togglePopup}> {loginState} </a>
        </div>
      </nav>
      
      
      {/* If User is Logged In: Show Additional Nav Bar */}
      {localStorage.getItem("username") !== "" ? 
        <div style={{width: '100%', height: '50px', backgroundColor: 'orange', marginTop: '42px', display: "flex", alignItems: 'center', justifyContent: 'center', gap: '100px'}}>
          <p style={{color: 'white'}}> Hi, {localStorage.getItem("username")}!</p>
          <div>
            <button className='loggedInNavBarButton'><Link to="/">Home</Link></button>
            <button className='loggedInNavBarButton'><Link to="/tracker" >Tracker</Link></button>
            <button onclick={toggleUpdatePopup} className='loggedInNavBarButton'>Updates</button>
            <button className='loggedInNavBarButton'>Settings</button>
          </div>
          {window.location.pathname.endsWith('/tracker') ? <LegacyToggle /> : ""}
        </div> 
      : ""}


    {/* Show Login/Register Popup if button is clicked */}
    {showPopup ? <LoginPopup text='Login' closePopup={togglePopup} /> : null }

    {showUpdatesPopup ? <UpdatesPopup text='Updates' closePopup={toggleUpdatePopup} /> : null }
    </>
  );
}

export default NavBar;
