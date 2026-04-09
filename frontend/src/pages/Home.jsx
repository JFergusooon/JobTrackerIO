// pages/Home.jsx
import React from 'react';
import NavBar from '../components/navBar';
import LegacyUI from '../components/LegacyUI';

function HomePage() {
  return <>
    <NavBar/>
  
    {/* Background Gradient */}
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(180deg,#9DBF9E 85%, #005157ff 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

      {localStorage.getItem("username") !== "" ? <>
        <div style={{height: '100vh', width: '50%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '5%'}}>
          <div style={{height: '25%', width: '30%', background: 'gray'}}>
              <p>Quick Settings</p>
              <button>Add New List</button>
            </div>
          
          <div style={{height: '40%', width: '30%', background: 'gray'}}>
            <p>Recent Lists</p>
          </div>


            
            <div style={{height: '40%', width: '100%', background: 'gray'}}>
              
              <p>Stats</p>

            <p>Total Jobs Applied This Month: </p>
            <p>Jobs goings to stage 2: </p>
            </div>


          
        </div>
      </> : 
        <>
          {/* Box that holds update boxes */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '50%', justifyContent: 'center', 
              alignItems: 'center', gap: '30px', padding: '20px', borderRadius: '10px', background: 'red' }}>

            {/* Left Side Grey Box */}
            <div style={{ backgroundColor: '#a59595ff', width: '50%', height: '450px', borderRadius: '40px'}}>
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
      <div style={{ backgroundColor: '#a59595ff', width: '50%', height: '450px', borderRadius: '40px' }}>
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
  </>
}


export default HomePage;