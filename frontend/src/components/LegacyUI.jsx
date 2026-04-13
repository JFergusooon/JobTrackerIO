import { useState } from 'react';
import '../css/TrackerPageCSS.css'
import EditJobButtons from '../components/Tracker/EditJobButtons'

function LegacyUI() { 

    const [curSearchResults, setCurSearchResult] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");

    const jobs = [
  { id: 1, title: "Software Engineer", company: "Google" },
  { id: 2, title: "SDET", company: "Amazon" },
  { id: 3, title: "Frontend Dev", company: "Meta" },
  { id: 4, title: "Backend Developer", company: "Apple" },
  { id: 5, title: "Full Stack Engineer", company: "Microsoft" },
  { id: 6, title: "DevOps Engineer", company: "Netflix" },
  { id: 7, title: "QA Engineer", company: "Tesla" },
  { id: 8, title: "Data Engineer", company: "Uber" },
  { id: 9, title: "Mobile Developer", company: "Airbnb" },
  { id: 10, title: "Cloud Engineer", company: "Spotify" },

  { id: 11, title: "Software Engineer", company: "Google" },
  { id: 12, title: "SDET", company: "Amazon" },
  { id: 13, title: "Frontend Dev", company: "Meta" },
  { id: 14, title: "Backend Developer", company: "Apple" },
  { id: 15, title: "Full Stack Engineer", company: "Microsoft" },
  { id: 16, title: "DevOps Engineer", company: "Netflix" },
  { id: 17, title: "QA Engineer", company: "Tesla" },
  { id: 18, title: "Data Engineer", company: "Uber" },
  { id: 19, title: "Mobile Developer", company: "Airbnb" },
  { id: 20, title: "Cloud Engineer", company: "Spotify" },

  { id: 21, title: "Software Engineer", company: "Google" },
  { id: 22, title: "SDET", company: "Amazon" },
  { id: 23, title: "Frontend Dev", company: "Meta" },
  { id: 24, title: "Backend Developer", company: "Apple" },
  { id: 25, title: "Full Stack Engineer", company: "Microsoft" },
  { id: 26, title: "DevOps Engineer", company: "Netflix" },
  { id: 27, title: "QA Engineer", company: "Tesla" },
  { id: 28, title: "Data Engineer", company: "Uber" },
  { id: 29, title: "Mobile Developer", company: "Airbnb" },
  { id: 30, title: "Cloud Engineer", company: "Spotify" },

  { id: 31, title: "Software Engineer", company: "Google" },
  { id: 32, title: "SDET", company: "Amazon" },
  { id: 33, title: "Frontend Dev", company: "Meta" },
  { id: 34, title: "Backend Developer", company: "Apple" },
  { id: 35, title: "Full Stack Engineer", company: "Microsoft" },
  { id: 36, title: "DevOps Engineer", company: "Netflix" },
  { id: 37, title: "QA Engineer", company: "Tesla" },
  { id: 38, title: "Data Engineer", company: "Uber" },
  { id: 39, title: "Mobile Developer", company: "Airbnb" },
  { id: 40, title: "Cloud Engineer", company: "Spotify" },

  { id: 41, title: "Software Engineer", company: "Google" },
  { id: 42, title: "SDET", company: "Amazon" },
  { id: 43, title: "Frontend Dev", company: "Meta" },
  { id: 44, title: "Backend Developer", company: "Apple" },
  { id: 45, title: "Full Stack Engineer", company: "Microsoft" },
  { id: 46, title: "DevOps Engineer", company: "Netflix" },
  { id: 47, title: "QA Engineer", company: "Tesla" },
  { id: 48, title: "Data Engineer", company: "Uber" },
  { id: 49, title: "Mobile Developer", company: "Airbnb" },
  { id: 50, title: "Cloud Engineer", company: "Spotify" }
];

    return (
        <>
            <div style={{width: '100%', height: '100vh', backgroundColor: 'green'}}>

                <div className='trackerContainer'>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', background: 'blue', padding: '5px', alignItems: 'center'}}>
            
                        <div style={{backgroundColor: '#3b393f', display: 'flex', justifyContent: 'center', gap: '30px', width: '60%'}}>
                            <div>
                                <p style={{color: 'white'}}>Waiting: </p>
                                <p style={{color: 'green'}}>1271</p>
                            </div>

                            <div>
                                <p style={{color: 'white'}}>Rejected: </p>
                                <p style={{color: 'red'}}>538</p>
                            </div>
                        </div>

                        <div style={{height: '40%', width: '100%', background: 'orange', display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
                            <p style={{margin: '0px', fontSize: '20px'}}>Search Company</p>
                            <input onChange={({ target }) => setCurSearchResult(target.value)}></input>
                            <textarea style={{height: '60%', width: '65%'}} disabled={true} value={curSearchResults}></textarea>

                            <button style={{height: '40px', width: '150px', borderRadius: '20px'}}>New Application</button>
                            <p style={{margin: '0px', marginBottom: '10px'}}>Selected: {selectedCompany}</p>
                        </div>

                        <div>
                        </div>

                        <div>
                            <p style={{margin: '0px', fontSize: '20px', color: 'white'}}>--- List Management ---</p>
                            <p style={{margin: '0px', fontSize: '16px', color: 'white'}}>Current List: Mar 2026</p>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                                <div style={{background: 'grey', height: '30px', width: '90px', borderRadius: '10px'}}>List 1</div>
                            </div>
                        </div>

                        <button>+ New List</button>
                        <button>Delete Current List</button>
            
                        <EditJobButtons />
                    </div>




                    {/* Right Column */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '30px', width: '95%',background: '#b80e0e'}}>
                        <div style={{width: '100%', backgroundColor: 'lightblue', height: '100%'}}>
                        <p>Mar 2026 List</p>

                        <div style={{textAlign: 'left', marginLeft: '20px'}}>
                            <p>Applications</p>

                            <div style={{display: 'flex', flexDirection: 'row', gap: '15%'}}>

                                <div style={{marginLeft: '20px'}} className="job-container">
                                    {/* Print Out All Jobs From This Month */}
                                    {jobs.map((job, index) => (
                                    <div key={index} className="job-card">
                                        <p style={{padding: '0px', margin: '0px'}}>{job.title}</p>
                                        <p style={{padding: '0px', margin: '0px'}}>{job.company}</p>

                                        <p style={{padding: '0px', margin: '0px'}}>{job.location}</p>

                                        <input type='checkbox' placeholder='rejected' style={{height: '15px'}}></input>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                {/* 
                <div style={{display: 'flex'}}>
                    

                    <div style={{width: '80%', backgroundColor: 'lightblue'}}>
                        <p>Applications</p>

                        <div>
                            <p>Mar 2026 List</p>

                            <div>
                                <div>
                                    <p>Active Applications X</p>
                                </div>
                                <div>
                                    <p>Rejected Applications X</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
                */}




                
            </div>
        </>
    );
};

export default LegacyUI;