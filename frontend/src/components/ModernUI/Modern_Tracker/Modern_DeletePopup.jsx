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

                        <h2 style={{width: '80%', margin: '0px', textAlign: 'center'}}>Password Required</h2>

                        <p style={{ width: '80%', margin: '0px', textAlign: 'center' }}>Enter password to delete: </p>
                        <p style={{ width: '80%', margin: '0px', textAlign: 'center' }}>{companyOrListName}</p>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80%', gap: '10px'}}>
                            <input style={{width: '80%', height: '30px', borderRadius: '10px'}} onChange={({ target }) => setEnteredPassword(target.value)}></input>
                            <button style={{
                                        height: '30px',
                                        width: '110px',
                                        borderRadius: '20px',
                                        background: enteredPassword === "1234" ? '#76ac5e' : 'gray',
                                        cursor: enteredPassword === "1234" ? 'pointer' : 'not-allowed'
                                    }} onClick={func === "company" ? deleteCompany : deleteList} disabled={enteredPassword === "1234" ? false : true}>Delete</button>
                        </div>
                        
                    </div>    
                </div>;
            </div>
        </div>
    );
};
export default Modern_DeletePopup;