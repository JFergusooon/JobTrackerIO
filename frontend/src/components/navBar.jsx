import { Link } from 'react-router-dom';
import { useState } from "react";
import LoginPopup from '../components/LoginPopup';
import "../css/navBarCSS.css"
{/*import ModernLoginComponent from '../Modern Components/ModernLoginComponent';*/}

const port = 3000;
const full = "http://localhost:" + port + "/"

function NavBar() { 
  {/* const [loginOpen, setLoginOpen] = useState(false); */}
  const [showPopup, setShowPopup] = useState(false);
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

  let loginState = ""
  loginState = localStorage.getItem('username') !== "" ? "Logout" : "Login";

  //let publicUrl = "http://localhost:3001/public/" + localStorage.getItem('username')
  //let privateUrl = "http://localhost:3001/private/" + localStorage.getItem('username')

  return (
    <>
      <nav className="navBarContainer">

        {/* Left Title */}
        <Link to="/" style={{ color: 'white', fontSize: '25px', margin: 0 }}> job-tracker.io </Link>

        {/* Right Buttons */}
        {/*<div style={{ display: 'flex', gap: '10px' }}>
          <div className='navBarButton' onClick={() => setLoginOpen(true)}
            > Login </div>
        </div>*/}

        <div className="menu-item is-active menu-item--play">
          <a href="#" className="menu-link" onClick={togglePopup}> {loginState} </a>
        </div>
      </nav>
      {localStorage.getItem("username") !== "" ? 
        <div style={{width: '100%', height: '50px', backgroundColor: 'orange', marginTop: '42px'}}>
          <p>Home</p>
        </div> 
      : ""}


    {/* Show Login/Register Popup if button is clicked */}
    {showPopup ? <LoginPopup text='Login' closePopup={togglePopup} /> : null }




      {/*<ModernLoginComponent open={loginOpen} onClose={() => setLoginOpen(false)} />*/}
    </>
  );
}

export default NavBar;
