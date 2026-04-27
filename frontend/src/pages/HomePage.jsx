// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar.jsx';
import LegacyUI_Home from '../components/LegacyUI/Legacy_Plus/LegacyUI_Home.jsx';
import ModernUI_Home from '../components/ModernUI/Modern_Plus/ModernUI_Home.jsx';
import ModernFooterComponent from '../components/ModernFooter.jsx'


function HomePage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div
      style={{
        height: '100%',
        background: 'linear-gradient(180deg, #9DBF9E 85%, #005157ff 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', 
        marginTop: '30px'
      }}>

      {localStorage.getItem("username") !== "" ? 
        <>
          {localStorage.getItem('legacyMode') === "true" ? <LegacyUI_Home /> : <ModernUI_Home />}
        </>
            : 
        <>
          {/* Box that holds update boxes */}
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'row', width: '50%', justifyContent: 'center', 
              alignItems: 'center', gap: '30px', padding: '20px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.4)' }}>

            {/* Left Side Grey Box */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '50%', height: '450px', borderRadius: '40px'}}>
              <h1 style={{ color: 'white' , borderBottom: '1px solid black' }}>Why Join JobTracker?</h1>
              <p style={{ color: 'white', margin: '0px' }}>JobTracker offers easy application tracking abilities for job seekers looking to land that next step in their career journey. </p>
              <p style={{ color: 'white', margin: '0px', borderBottom: '1px solid black'   }}>We are here to help!</p>
              <ul>
                <li>Create Lists to seperate applications</li>
                <li>Track Rejection Status</li>
              </ul>
              <div style={{height: '125px'}}/>
              <p style={{padding: '0px', margin: '0px'}}>Create an Account or Log In to get Started!</p>
            
            <div style={{width: '100%', height: '5%', borderBottom: '2px solid black'}}>
            </div>




      <div style={{display: 'flex', flexDirection: 'column', gap: '0px'}}>
        <h3 style={{height: '25px', padding: '0px', margin: '0px'}}>
          Also enjoy a windows application version
        </h3>
        <a href='/github' style={{padding: '0px'}}> Download Link </a>
      </div>
      </div>

      {/* Right Side Grey Box */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '50%', height: '450px', borderRadius: '40px' }}>
        <h1 style={{ color: 'white' }}>JobTracker ChangeList</h1>
        <p>Update 0.0.5 - Setup Update</p>
        <p>Changes: </p>
        <ul style={{width: '300px'}}>
          <li style={{width: '300px', textAlign: 'Left', marginLeft: '15%'}}>Setup Home Page</li>
          <li style={{width: '300px', textAlign: 'Left', marginLeft: '15%'}}>Create Login/SignUp Popup Component</li>
        </ul>
      </div>

          </div>
        </>
      }


  
    </div>
    <ModernFooterComponent />
  </>
}


export default HomePage;