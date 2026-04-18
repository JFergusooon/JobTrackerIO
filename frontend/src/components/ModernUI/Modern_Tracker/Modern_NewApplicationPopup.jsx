import '../../../css/Modern_TrackerPageCSS.css';
import { useState } from 'react';

const Modern_NewApplicationPopup = ({text, closePopup, listNames }) => {


    const [newCompanyName, setNewCompanyName] = useState("");
    const [newJobLink, setNewJobLink] = useState("");
    const [newList, setNewList] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [newPosition, setNewPosition] = useState("");

    async function addNewApplication() {
        console.log('Adding new application' + text)


        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/create" 

        const params = {
            username: localStorage.getItem('username'),
            dateApplied: new Date().toISOString(),
            companyName: newCompanyName,
            jobLink: newJobLink,
            list: newList,
            location: newLocation,
            position: newPosition, 
            rejected: false
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

        closePopup()
        window.location.reload()
    }


    return <div>
                <div>
                    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                                justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                        {/* Actual Login Box */}
                        <div onClick={(e) => e.stopPropagation()} className='newApplicationFormContainer'>
                            <button onClick={closePopup} className='newListCloseButton'> × </button>

                            <h3 style={{ margin: '2px', background:'#3069aa', color: 'white', width: '100%'}}>Add Job Application</h3>

                            <p style={{margin: '0px'}}>Company Name: </p>
                            <input placeholder="Enter Text..." style={{width: '80%', height: '30px', borderRadius: '10px'}} onChange={({ target }) => setNewCompanyName(target.value)}/>

                            <p style={{margin: '0px'}}>Position: </p>
                            <input placeholder="Enter Text..." style={{width: '80%', height: '30px', borderRadius: '10px'}} onChange={({ target }) => setNewPosition(target.value)}/>

                            <p style={{margin: '0px'}}>Remote / Location: </p>
                            <input placeholder="Enter Text..." style={{width: '80%', height: '30px', borderRadius: '10px'}} onChange={({ target }) => setNewLocation(target.value)}/>

                            <p style={{margin: '0px'}}>Job Link: </p>
                            <input placeholder="Enter Text..." style={{width: '80%', height: '30px', borderRadius: '10px'}} onChange={({ target }) => setNewJobLink(target.value)}/>

                            <p style={{margin: '0px'}}>List: </p>
                            <select style={{ width: '80%', height: '30px', borderRadius: '10px' }} onChange={(e) => setNewList(e.target.value)} defaultValue="">
                                <option value="" disabled> Select a list... </option>
                                {listNames?.map((list, index) => (
                                    <option key={index} value={list}> {list} </option>
                                ))}
                            </select>

                            <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
                                <button onClick={addNewApplication} disabled={!newList} style={{ height: '30px', width: '110px', 
                                                                    borderRadius: '20px', background: newList ? '#76ac5e' : 'gray',
                                                                    cursor: newList ? 'pointer' : 'not-allowed' }}> Add Application
                                </button>
                            </div>

                        </div>    
                    </div>;
                </div>
            </div>;

        
    
};
export default Modern_NewApplicationPopup;