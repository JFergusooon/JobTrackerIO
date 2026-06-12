import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Popup = ({text, closePopup}) => {
    const navigate = useNavigate();
    const [curFunc, setCurFunc] = useState("login");

    const [inputUser, setInputUser] = useState("");
    const [inputPass, setInputPass] = useState("");
    const [loginError, setLoginError] = useState(null);

    const [regUser, setRegUser] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regFirst, setRegFirst] = useState("");
    const [regLast, setRegLast] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regError, setRegError] = useState(null);
    const [regStatus, setRegStatus] = useState(null);

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
                    setAllUsers(result["body"]);
                },
                (error) => {
                    console.error('Failed to fetch users:', error);
                }
            )
    }, [])

    function changeForm() {
        if(curFunc === "login") {
            setCurFunc("register");
            setRegError(null);
            setRegStatus(null);
            setLoginError(null);
        }
        if(curFunc === "register") {
            setCurFunc("login")
            setLoginError(null);
        }
    }

    function handleNoSpaceKeyDown(e) {
        if (e.key === ' ') {
            e.preventDefault();
        }
    }

        
    async function loginUser() {
        console.log("Login Button Pressed")

        if (!allUsers || allUsers.length === 0) {
            console.log("Users not loaded yet");
            setLoginError("Users are still loading. Please try again.");
            return;
        }

        let match = false;
        let usernameExists = false;
        let matchedUsername = "";
        let matchedAppearanceScheme = "";
        const normalizedInputUser = inputUser.trim().toLowerCase();
        for (let i = 0; i < allUsers.length; i++) {

            const candidateUsername = String(allUsers[i].username || '').trim().toLowerCase();
            if (normalizedInputUser === candidateUsername) {
                console.log("USERNAME MATCHED!");
                usernameExists = true;
                if(inputPass === allUsers[i].password) {
                    console.log("PASSWORD MATCHED!");
                    match = true;
                    matchedUsername = allUsers[i].username;
                    matchedAppearanceScheme = allUsers[i].curAppearanceScheme;
                    break;
                }                else {
                    console.log("PASSWORD DID NOT MATCH");
                }
            }
        }

        if(match) {
            setLoginError(null);
            localStorage.setItem('username', matchedUsername)
            localStorage.setItem('password', inputPass)

            const validSchemes = ['Forest', 'Ocean', 'Sunset'];
            if (validSchemes.includes(matchedAppearanceScheme)) {
                localStorage.setItem('curAppearanceScheme', matchedAppearanceScheme);
            } else {
                localStorage.setItem('curAppearanceScheme', 'Forest');
            }

            // Fetch the user's appearance scheme immediately after login
            try {
                const stage = 'https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev';
                const url = `${stage}/Users/getByUsername?username=${encodeURIComponent(matchedUsername)}`;
                const encode = window.btoa('admin:admin');
                const res = await fetch(url, {
                    headers: { Authorization: 'Basic ' + encode },
                    method: 'GET'
                });
                if (res.ok) {
                    const userData = await res.json();
                    const sourceUser = userData?.body || userData;
                    const backendAppearance = sourceUser?.curAppearanceScheme;
                    if (validSchemes.includes(backendAppearance)) {
                        localStorage.setItem('curAppearanceScheme', backendAppearance);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch appearance scheme on login:', err);
            }

            closePopup();
            navigate('/home');
            window.dispatchEvent(new Event('authChange'));
            window.dispatchEvent(new Event('appearanceChange'));
            return;
        }

        if (!usernameExists) {
            setLoginError("Username does not exist.");
        } else {
            setLoginError("Password is incorrect.");
        }



    }

    /* Validate register form fields */
    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(regEmail);
    }

    function validatePassword() {
        if (!regPass) return { valid: false, errors: [] };
        
        const errors = [];
        
        if (regPass.length < 8) errors.push("At least 8 characters");
        if (!/\d/.test(regPass)) errors.push("At least 1 number");
        if (!/[!?]/.test(regPass)) errors.push("At least 1 symbol (! or ?)");
        if (!/^[a-zA-Z0-9!?]+$/.test(regPass)) errors.push("Only letters, numbers, ! and ? are allowed");
        
        return { valid: errors.length === 0, errors };
    }

    function validateRegisterForm() {
        const missingFields = [];
        
        if (!regFirst.trim()) missingFields.push("First Name");
        if (!regLast.trim()) missingFields.push("Last Name");
        if (!regUser.trim()) missingFields.push("Username");
        if (!regEmail.trim()) missingFields.push("Email");
        if (!regPass.trim()) missingFields.push("Password");

        if (missingFields.length > 0) {
            if (missingFields.length === 1) {
                setRegError(`${missingFields[0]} is required`);
            } else {
                setRegError("Please fill out all fields");
            }
            return false;
        }

        if (!validateEmail()) {
            setRegError("Email must look like: name@domain.com");
            return false;
        }

        const passwordValidation = validatePassword();
        if (!passwordValidation.valid) {
            setRegError(`Password must have: ${passwordValidation.errors.join(", ")}`);
            return false;
        }

        setRegError(null);
        return true;
    }

    /* Working with AWS-DynamoDB & Python Lambda (Table: JobTracker-Users) */
    async function registerUser() {
        console.log("CLICKED REGISTER");

        if (!validateRegisterForm()) {
            return;
        }

        setRegStatus("Registering...");
        setRegError(null);

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
            
            setRegStatus("Register Successful");
            setTimeout(() => {
                closePopup();
            }, 1500);
        } catch (err) {
            console.error("ERROR:", err);
            setRegStatus(null);
            setRegError("An error occurred. Please try again.");
        }
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
                                onChange={({ target }) => {
                                    setInputUser(target.value);
                                    if (loginError) setLoginError(null);
                                }}
                                style={inputStyle}
                            />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    autoComplete="current-password"
                                    value={inputPass}
                                    onChange={({ target }) => {
                                        setInputPass(target.value);
                                        if (loginError) setLoginError(null);
                                    }}
                                    style={inputStyle}
                                />

                                {loginError && (
                                    <div style={{
                                        color: "#ff4444",
                                        fontSize: "13px",
                                        marginBottom: "12px",
                                        textAlign: "center",
                                        fontWeight: "500"
                                    }}>
                                        {loginError}
                                    </div>
                                )}

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
                                    onKeyDown={handleNoSpaceKeyDown}
                                    onChange={({ target }) => setRegFirst(target.value.replace(/\s/g, ''))}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                name="lastName"
                                value={regLast}
                                    onKeyDown={handleNoSpaceKeyDown}
                                    onChange={({ target }) => setRegLast(target.value.replace(/\s/g, ''))}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                autoComplete="username"
                                value={regUser}
                                    onKeyDown={handleNoSpaceKeyDown}
                                    onChange={({ target }) => setRegUser(target.value.replace(/\s/g, ''))}
                                style={inputStyle}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                autoComplete="email"
                                value={regEmail}
                                    onKeyDown={handleNoSpaceKeyDown}
                                    onChange={({ target }) => setRegEmail(target.value.replace(/\s/g, ''))}
                                style={inputStyle}
                            />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={regPass}
                                        onKeyDown={handleNoSpaceKeyDown}
                                    onChange={({ target }) => setRegPass(target.value.replace(/[^a-zA-Z0-9!?]/g, ''))}
                                    style={inputStyle}
                                />

                                {regPass && (
                                    <div style={{
                                        fontSize: "12px",
                                        marginBottom: "12px",
                                        color: "#a0a0a0",
                                        display: "flex",
                                        gap: "16px",
                                        flexWrap: "wrap"
                                    }}>
                                        <div style={{
                                            color: regPass.length >= 8 ? "#44ff44" : "#ff4444"
                                        }}>
                                            {regPass.length >= 8 ? "✓" : "✗"} 8 chars
                                        </div>
                                        <div style={{
                                            color: /\d/.test(regPass) ? "#44ff44" : "#ff4444"
                                        }}>
                                            {/\d/.test(regPass) ? "✓" : "✗"} 1 number
                                        </div>
                                        <div style={{
                                            color: /[!?]/.test(regPass) ? "#44ff44" : "#ff4444"
                                        }}>
                                            {/[!?]/.test(regPass) ? "✓" : "✗"} ! or ?
                                        </div>
                                        <div style={{
                                            color: /^[a-zA-Z0-9!?]+$/.test(regPass) ? "#44ff44" : "#ff4444"
                                        }}>
                                            {/^[a-zA-Z0-9!?]+$/.test(regPass) ? "✓" : "✗"} only letters/numbers/!/?
                                        </div>
                                    </div>
                                )}

                                {regError && (
                                    <div style={{
                                        color: "#ff4444",
                                        fontSize: "13px",
                                        marginBottom: "12px",
                                        textAlign: "center",
                                        fontWeight: "500"
                                    }}>
                                        {regError}
                                    </div>
                                )}

                                {regStatus && (
                                    <div style={{
                                        color: "#44ff44",
                                        fontSize: "13px",
                                        marginBottom: "12px",
                                        textAlign: "center",
                                        fontWeight: "500"
                                    }}>
                                        {regStatus}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "12px", flexDirection: "row" }}>
                                    <button
                                        onClick={registerUser}
                                        disabled={regStatus !== null}
                                        style={{
                                            ...buttonStyle, 
                                            flex: 1,
                                            opacity: regStatus !== null ? 0.6 : 1,
                                            cursor: regStatus !== null ? "not-allowed" : "pointer"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (regStatus === null) {
                                                e.target.style.backgroundColor = "#3a8eef";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (regStatus === null) {
                                                e.target.style.backgroundColor = "#4a9eff";
                                            }
                                        }}
                                    >
                                        Create Account
                                    </button>
                                    <button
                                        onClick={closePopup}
                                        disabled={regStatus !== null}
                                        style={{...cancelButtonStyle, flex: 1, marginBottom: "0px", opacity: regStatus !== null ? 0.6 : 1, cursor: regStatus !== null ? "not-allowed" : "pointer"}}
                                        onMouseEnter={(e) => {
                                            if (regStatus === null) {
                                                e.target.style.backgroundColor = "#3a3a3c";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (regStatus === null) {
                                                e.target.style.backgroundColor = "#2c2c2e";
                                            }
                                        }}
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