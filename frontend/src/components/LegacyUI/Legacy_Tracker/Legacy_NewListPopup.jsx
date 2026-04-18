import '../../../css/Legacy_TrackerPageCSS.css';
import { useState } from 'react';

const Legacy_NewListPopup = ({text, closePopup}) => {

    const [newListName, setNewListName] = useState("");

    async function addNewList() {
        console.log('Adding new list with' + newListName)


        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Users/updateListNames" 
                     + "?username=" + localStorage.getItem('username')
                     + "&newListName=" + newListName;


        try {
            const res = await fetch(url, {
                method: "PATCH"
            });

            const data = await res.json();
            console.log("SUCCESS:", data);
        } catch (err) {
            console.error("ERROR:", err);
        }

        closePopup()
        window.location.href = "/tracker?listName=" + newListName
        window.location.reload()
    }


    return (
        <div>
            <div>
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                             justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                    {/* Actual Login Box */}
                    <div onClick={(e) => e.stopPropagation()} className='newListFormContainer'>
                        <button onClick={closePopup} className='newListCloseButton'> × </button>

                        <h3 style={{ margin: '2px' }}>Enter a name for the new list:</h3>
                        <input placeholder="New List Name" style={{width: '80%', height: '30px', borderRadius: '10px'}} onChange={({ target }) => setNewListName(target.value)}/>
                        <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
                            <button style={{height: '30px', width: '90px', borderRadius: '20px', background: '#76ac5e'}}
                                    onClick={addNewList}>Ok</button>

                            <button style={{height: '30px', width: '90px', borderRadius: '20px', background: '#cf6161'}} onClick={closePopup}>Cancel</button>
                        </div>

                    </div>    
                </div>;
            </div>
        </div>
    );
};
export default Legacy_NewListPopup;