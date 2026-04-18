import '../../../css/ModernLoginCSS.css';
import { useState } from 'react';

const Modern_DeletePopup = ({func, companyOrListName, closePopup}) => {

    const [enteredPassword, setEnteredPassword] = useState("");

    async function deleteCompany() {
        console.log('Deleting Company: ' + companyOrListName);

        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/deleteJob"
                    + "?username=" + localStorage.getItem('username')
                    + "&companyName=" + companyOrListName;

        try {
            const res = await fetch(url, {
                method: "DELETE"
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
        } catch (err) {
            console.error("ERROR:", err);
        }

        window.location.reload();
    }

    async function removeListFromUser() {
        console.log('Deleting List "' + companyOrListName + '" from User Item'
        );
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Users/removeList"
                    + "?username=" + localStorage.getItem('username')
                    + "&existingListName=" + companyOrListName;
        try {
            const res = await fetch(url, {
                method: "PATCH"
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
            window.location.href = "/tracker"
        } catch (err) {
            console.error("ERROR:", err);
        }
    }

    async function removeJobsWithList() {
        console.log('Deleting All Jobs w/ ListName "' + companyOrListName + '"'
        );
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/deleteJobByListName"
                    + "?username=" + localStorage.getItem('username')
                    + "&listName=" + companyOrListName;
        try {
            const res = await fetch(url, {
                method: "DELETE"
            });

            const data = await res.json();
            console.log("SUCCESS:", data);

            window.location.href = "/tracker"
            window.location.reload();
        } catch (err) {
            console.error("ERROR:", err);
        }
    }

    async function deleteList() {
        removeListFromUser();
        removeJobsWithList();
    }

    return (
        <div className='popup'>
            <div className='popup_open'>
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                             justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                    {/* Actual Login Box */}
                    <div onClick={(e) => e.stopPropagation()} className='loginFormContainer'>
                        <button onClick={closePopup} className='loginCloseButton'> × </button>

                        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Password Required</h2>

                        <p style={{ margin: 0 }}>Enter password to delete: </p>
                        <p style={{ marginTop: 0 }}>{companyOrListName}</p>
                        <input onChange={({ target }) => setEnteredPassword(target.value)}></input>
                        <button onClick={func === "company" ? deleteCompany : deleteList} disabled={enteredPassword === "1234" ? false : true}>Delete</button>
                    </div>    
                </div>;
            </div>
        </div>
    );
};
export default Modern_DeletePopup;