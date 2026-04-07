import {useLocation} from "react-router-dom";
import Popup from "./LoginPopup";
import {useState} from "react";

const port = 3000;
const full = "http://localhost:" + port + "/"

const Header = ({ title }) => {
    console.log("u: " + localStorage.getItem('username'))
    console.log("p: " + localStorage.getItem('password'))
    const [showPopup, setShowPopup] = useState(false);
    const togglePopup = () => {
        if(loginState === "Logout" && localStorage.getItem('username') !== "" && localStorage.getItem('password') !== "")
        {
            localStorage.setItem('username', '')
            localStorage.setItem('password', '')
            window.location.reload()
        }
        else
        {
            setShowPopup(!showPopup);
        }

    }

    let loginState = ""
    if(localStorage.getItem('username') !== "")
    {
        loginState = "Logout";
    }
    else
    {
        loginState = "Login";
    }

    let publicUrl = "http://localhost:3001/public/" + localStorage.getItem('username')
    let privateUrl = "http://localhost:3001/private/" + localStorage.getItem('username')
    return (
        <header className="header">
            <div className="wrap">

                <a style={{fontSize: "14px", marginTop: "65px"}} href={publicUrl}>{localStorage.getItem('username') !== "" ? localStorage.getItem('username') : ""}</a>
                <nav className="menu">
                            <ul className="menu-list">
                                <li className="menu-item is-active menu-item--play">
                                    <a href='http://localhost:3001/home' className="menu-link">
                                        Home
                                    </a>
                                </li>
                                <li className="menu-item is-active menu-item--play">
                                    <a href='http://localhost:3001/trending' className="menu-link">
                                        Trending
                                    </a>
                                </li>
                                <li className="menu-item is-active menu-item--play">
                                    <a href='http://localhost:3001/findpeople' className="menu-link">
                                        Find People
                                    </a>
                                </li>
                                <li className="menu-item is-active menu-item--play">
                                    <a href="http://localhost:3001/groups" className="menu-link">
                                        Groups
                                    </a>
                                </li>
                                <li className="menu-item is-active menu-item--play">
                                    <a href="#" className="menu-link" onClick={togglePopup}>
                                        {loginState}
                                    </a>
                                </li>
                                <li className="menu-item is-active menu-item--play">
                                    <a href={privateUrl} className="menu-link">
                                        MyPage
                                    </a>
                                </li>

                            </ul>
                </nav>
                {showPopup ?
                    <Popup
                        text='Login'
                        closePopup={togglePopup}
                    />
                    : null
                }
            </div>
        </header>
    );
}

export default Header