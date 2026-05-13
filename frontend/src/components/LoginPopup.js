import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Popup = ({text, closePopup}) => {
    const navigate = useNavigate();
    const [curFunc, setCurFunc] = useState("login");

    const [inputUser, setInputUser] = useState("");
    const [inputPass, setInputPass] = useState("");

    const [regUser, setRegUser] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regFirst, setRegFirst] = useState("");
    const [regLast, setRegLast] = useState("");
    const [regEmail, setRegEmail] = useState("");

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
        let matchedUsername = "";
        const normalizedInputUser = inputUser.trim().toLowerCase();
        let allUsersSize = allUsers.length;
        console.log("Total Number of Users: " + allUsersSize)
        console.log("Searching for username in system: " + inputUser)
        for (let i = 0; i < allUsers.length; i++) {
            console.log(i + ": " + allUsers[i].username);

            const candidateUsername = String(allUsers[i].username || '').trim().toLowerCase();
            if (normalizedInputUser === candidateUsername) {
                console.log("USERNAME MATCHED!");
                if(inputPass === allUsers[i].password) {
                    console.log("PASSWORD MATCHED!");
                    match = true;
                    matchedUsername = allUsers[i].username;
                    break;
                }                else {
                    console.log("PASSWORD DID NOT MATCH");
                }
            }
        }

        if(match) {
            localStorage.setItem('username', matchedUsername)
            localStorage.setItem('password', inputPass)
            closePopup();
            window.dispatchEvent(new Event('authChange'));
        }



    }

    /* Working with AWS-DynamoDB & Python Lambda (Table: JobTracker-Users) */
    async function registerUser() {
        console.log("CLICKED REGISTER");

        const url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev/Users/create";

        const today = new Date();
        const dateCreated = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

        const params = {
            username: regUser,
            firstName: regFirst,
            lastName: regLast,
            email: regEmail,
            password: regPass,
            dateCreated: dateCreated,
            curAppearanceScheme: 'Forest',
            careerTitle: [],
            listNames: [],
            location: '',
            quickNotes: '',
            profilePictureFileName: ''
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
        const overlayStyle = {
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
        };

        const cardStyle = {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "16px",
            padding: "0",
            width: "440px",
            maxWidth: "95vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            border: "2px solid rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            color: "#f0f0f0",
            fontFamily: "system-ui, -apple-system, sans-serif",
            overflow: "hidden",
        };

        const tabContainerStyle = {
            display: "flex",
            gap: "8px",
            padding: "20px 32px 0 32px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
        };

        const tabButtonStyle = (isActive) => ({
            padding: "10px 24px",
            borderRadius: "8px 8px 0 0",
            border: isActive ? "none" : "1px solid rgba(0, 0, 0, 0.2)",
            backgroundColor: isActive ? "#4a9eff" : "#2c2c2e",
            color: isActive ? "#ffffff" : "#a0a0a0",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
        });

        const contentStyle = {
            padding: "32px 32px 28px",
            display: "flex",
            flexDirection: "column",
        };

        const inputStyle = {
            width: "100%",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #3a3a3c",
            backgroundColor: "#2c2c2e",
            color: "#f0f0f0",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "16px",
        };

        const buttonStyle = {
            padding: "10px 22px",
            borderRadius: "8px",
            border: "1px solid transparent",
            backgroundColor: "#4a9eff",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
            width: "100%",
            boxSizing: "border-box",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        };

        const cancelButtonStyle = {
            padding: "10px 22px",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: "#2c2c2e",
            color: "#f0f0f0",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
            width: "100%",
            boxSizing: "border-box",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        };

        switch(curFunc) {
            case 'login':
                return (
                    <div style={overlayStyle} onClick={closePopup}>
                        <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
                            <div style={tabContainerStyle}>
                                <button style={tabButtonStyle(true)} disabled>
                                    Login
                                </button>
                                <button
                                    style={tabButtonStyle(false)}
                                    onClick={changeForm}
                                    onMouseEnter={(e) => !false && (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)")}
                                    onMouseLeave={(e) => !false && (e.target.style.backgroundColor = "transparent")}
                                >
                                    Register
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => { e.preventDefault(); loginUser(); }}
                                style={contentStyle}
                                method="post"
                                action=""
                            >
                                <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                autoComplete="username"
                                value={inputUser}
                                onChange={({ target }) => setInputUser(target.value)}
                                style={inputStyle}
                            />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    autoComplete="current-password"
                                    value={inputPass}
                                    onChange={({ target }) => setInputPass(target.value)}
                                    style={inputStyle}
                                />

                                <div style={{ display: "flex", gap: "12px", flexDirection: "row" }}>
                                    <button
                                        type="submit"
                                        style={{...buttonStyle, flex: 1}}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#3a8eef"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#4a9eff"}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closePopup}
                                        style={{...cancelButtonStyle, flex: 1, marginBottom: "0px"}}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3c"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#2c2c2e"}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'register':
                return (
                    <div style={overlayStyle} onClick={closePopup}>
                        <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
                            <div style={tabContainerStyle}>
                                <button
                                    style={tabButtonStyle(false)}
                                    onClick={changeForm}
                                    onMouseEnter={(e) => !false && (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)")}
                                    onMouseLeave={(e) => !false && (e.target.style.backgroundColor = "transparent")}
                                >
                                    Login
                                </button>
                                <button style={tabButtonStyle(true)} disabled>
                                    Register
                                </button>
                            </div>
                            <div style={contentStyle}>
                                <input
                                type="text"
                                placeholder="First Name"
                                name="firstName"
                                value={regFirst}
                                onChange={({ target }) => setRegFirst(target.value)}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                name="lastName"
                                value={regLast}
                                onChange={({ target }) => setRegLast(target.value)}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                autoComplete="username"
                                value={regUser}
                                onChange={({ target }) => setRegUser(target.value)}
                                style={inputStyle}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                autoComplete="email"
                                value={regEmail}
                                onChange={({ target }) => setRegEmail(target.value)}
                                style={inputStyle}
                            />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={regPass}
                                    onChange={({ target }) => setRegPass(target.value)}
                                    style={inputStyle}
                                />

                                <div style={{ display: "flex", gap: "12px", flexDirection: "row" }}>
                                    <button
                                        onClick={registerUser}
                                        style={{...buttonStyle, flex: 1}}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#3a8eef"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#4a9eff"}
                                    >
                                        Create Account
                                    </button>
                                    <button
                                        onClick={closePopup}
                                        style={{...cancelButtonStyle, flex: 1, marginBottom: "0px"}}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3c"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "#2c2c2e"}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <p>DEFAULT</p>;
        }
    }

    return (
        <div>
            {performSwitch()}
        </div>
    );
};
export default Popup;