import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../css/ModernLoginCSS.css';

const Popup = ({text, closePopup}) => {
    const [curFunc, setCurFunc] = useState("login");

    const [inputUser, setInputUser] = useState("");
    const [inputPass, setInputPass] = useState("");


    const [regUser, setRegUser] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regFirst, setRegFirst] = useState("");
    const [regLast, setRegLast] = useState("");
    const [regEmail, setRegEmail] = useState("");


    const [searUser, setSearUser] = useState([]);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [allUsers, setAllUsers] = useState([]);


    useEffect(() => {
        let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
        let url = stage_url + "/Users/getAll"
        let encode = window.btoa("admin:admin");
        fetch(url, {
            headers: {
                'Authorization':  'Basic ' + encode }}
        )
            .then(res => res.json())
            .then(
                (result) => {
                    console.log("setting allUsers to api result: " + JSON.stringify(result["body"]));
                    setIsLoaded(true);
                    setAllUsers(result["body"]);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    function changeForm() {
        if(curFunc === "login")
            setCurFunc("register")
        if(curFunc === "register")
            setCurFunc("login")
    }

        
    async function loginUser() {
        console.log("Login Button Pressed")

        if (!allUsers || allUsers.length === 0) {
            console.log("Users not loaded yet");
            return;
        }

        let match = false;
        let allUsersSize = allUsers.length;
        console.log("Total Number of Users: " + allUsersSize)
        console.log("Searching for username in system: " + inputUser)
        for (let i = 0; i < allUsers.length; i++) {
            console.log(i + ": " + allUsers[i].username);

            if (inputUser === allUsers[i].username) {
                console.log("USERNAME MATCHED!");
                if(inputPass === allUsers[i].password) {
                    console.log("PASSWORD MATCHED!");
                    match = true;
                    break;
                }                else {
                    console.log("PASSWORD DID NOT MATCH");
                }
            }
        }

        if(match) {
            localStorage.setItem('username', inputUser)
            localStorage.setItem('password', inputPass)
            console.log("[localStorage] cur Username Set : " + localStorage.getItem("username"))
            console.log("[localStorage] cur Password Set : " + localStorage.getItem("password"))
            closePopup()
            window.location.reload();
        }



    }

    /* Working with AWS-DynamoDB & Python Lambda (Table: JobTracker-Users) */
    async function registerUser() {
        console.log("CLICKED REGISTER");

        const url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev/Users/create";

        const params = {
            username: regUser,
            firstName: regFirst,
            lastName: regLast,
            email: regEmail,
            password: regPass,
            jobJson: "{}",
            dateCreated: "04/07/2026"
        };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
        } catch (err) {
            console.error("ERROR:", err);
        }

        closePopup();


    }


    /* Performs the Switching of the Login & Register Forms */
    function performSwitch() {
        switch(curFunc) {
            case 'login':
                        /* Transparent Gray Background When Popup is open to stop users from clicking behind.  */
                return <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                                    justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                            {/* Actual Login Box */}
                            <div onClick={(e) => e.stopPropagation()} className='loginFormContainer'>
                                <button onClick={closePopup} className='loginCloseButton'> × </button>

                                <h2 style={{ marginTop: 0 }}>Login</h2>

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    
                                    {/* Text Inputs */}
                                    <input type="text" placeholder="Username" className="loginFormTextBox" onChange={({ target }) => setInputUser(target.value)}/>
                                    <input type="password" placeholder="Password" className="loginFormTextBox" onChange={({ target }) => setInputPass(target.value)}/>
                                    
                                    
                                    
                                    
                                    
                                    {/* Buttons */}
                                    <button className="loginSubmitButton" onClick={loginUser}> Log In </button>

                                    <p style={{padding: '0px', margin: '0px'}}> Dont have an account? 
                                        <button style={{padding: '0px', margin: '0px', color: '#3F5EFB'}} onClick={changeForm}>Register</button>
                                    </p>
                                </div>
                            </div>    
                        </div>;
            case 'register':
                        /* Transparent Gray Background When Popup is open to stop users from clicking behind.  */
                return <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                                    justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                            {/* Actual Register Box */}            
                            <div onClick={(e) => e.stopPropagation()} className='loginFormContainer'>
                                <button onClick={closePopup} className='loginCloseButton'> × </button>

                                <h2 style={{ marginTop: 0 }}>Register</h2>

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {/* Text Inputs */}
                                    <input placeholder="First Name" className="loginFormTextBox" onChange={({ target }) => setRegFirst(target.value)}/>
                                    <input placeholder="Last Name" className="loginFormTextBox" onChange={({ target }) => setRegLast(target.value)}/>
                                    <input placeholder="Username" className="loginFormTextBox" onChange={({ target }) => setRegUser(target.value)}/>
                                    <input placeholder="Email" className="loginFormTextBox" onChange={({ target }) => setRegEmail(target.value)}/>
                                    <input placeholder="Password" className="loginFormTextBox" onChange={({ target }) => setRegPass(target.value)}/>
                                    
                                    
                                    {/* Buttons */}
                                    <button className="loginSubmitButton" onClick={registerUser}> Submit </button>

                                    <p style={{padding: '0px', margin: '0px'}}> Already have an account? 
                                        <button style={{padding: '0px', margin: '0px', color: '#3F5EFB'}} onClick={changeForm}>Login</button>
                                    </p>
                                </div>
                            </div>    
                        </div>;
            default:
                return <p>DEFAULT</p>;
        }
    }

    return (
        <div className='popup'>
            <div className='popup_open'>
                {performSwitch()}
            </div>
        </div>
    );
};
export default Popup;