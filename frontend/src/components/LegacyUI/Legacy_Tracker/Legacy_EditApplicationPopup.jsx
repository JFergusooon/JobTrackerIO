import '../../../css/Legacy_TrackerPageCSS.css';
import { useState } from 'react';

const Legacy_EditApplicationPopup = ({job, closePopup}) => {

    const [companyName, setCompanyName] = useState(job.companyName);
    const [position, setPosition] = useState(job.position);
    const [location, setLocation] = useState(job.location);
    const [jobLink, setJobLink] = useState(job.jobLink);

    const hasChanges =
        position !== job.position ||
        location !== job.location ||
        jobLink !== job.jobLink;

    const buildPatchBody = () => {
        const body = {};

        if (position !== job.position) body.position = position;
        if (location !== job.location) body.location = location;
        if (jobLink !== job.jobLink) body.jobLink = jobLink;

        return body;
    };

    async function editApplication() {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = stage + "/Jobs/update?username=" + localStorage.getItem('username') + "&companyName=" + companyName;

        const params = buildPatchBody();

        try {
            const res = await fetch(url, {
                method: "PATCH",
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
        window.location.reload();
    }


    return (
        <div>
            <div>
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
                              justifyContent: "center", alignItems: "center", zIndex: 9999, }}>
                {/* Actual Login Box */}
                    <div onClick={(e) => e.stopPropagation()} className='newApplicationFormContainer'>
                        <button onClick={closePopup} className='newListCloseButton'> × </button>

                        <h3 style={{ margin: '2px', background:'#3069aa', color: 'white', width: '100%'}}>Edit Job Application</h3>

                        <p style={{margin: '0px'}}>Company Name: </p>
                        <p style={{ margin: '0px', fontWeight: 'bold' }}>
                            {companyName}
                        </p>

                        <p style={{margin: '0px'}}>Position: </p>
                        <input value={position} onChange={(e) => setPosition(e.target.value)}></input>

                        <p style={{margin: '0px'}}>Remote / Location: </p>
                        <input value={location} onChange={(e) => setLocation(e.target.value)}></input>

                        <p style={{margin: '0px'}}>Job Link: </p>
                        <input value={jobLink} onChange={(e) => setJobLink(e.target.value)}></input>




                        <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
                            <button onClick={editApplication} disabled={!hasChanges}
                                    style={{
                                        height: '30px',
                                        width: '110px',
                                        borderRadius: '20px',
                                        background: hasChanges ? '#76ac5e' : 'gray',
                                        cursor: hasChanges ? 'pointer' : 'not-allowed'
                                    }}>Save Changes
                            </button>
                            <button onClick={closePopup}>Cancel</button>
                        </div>
                    </div>    
                </div>;
            </div>
        </div>
    );
};

export default Legacy_EditApplicationPopup;

