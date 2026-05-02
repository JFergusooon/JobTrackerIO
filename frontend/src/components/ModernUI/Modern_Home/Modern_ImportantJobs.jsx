import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';
import { FaStar } from "react-icons/fa";

const Modern_ImportantJobs = ({importantJobsList, closePopup}) => {

    const [importantJobs, setImportantJobs] = useState(importantJobsList);

    let importantJobsData = [{
        company: "Ferguson Software Solutions",
        position: "Software Engineer",
        interviewDate: "2026-04-27",
        stage: "Stage 1 Interview"
    },
    {
        company: "LiveView Technologies",
        position: "Software Test Engineer",
        interviewDate: "2026-04-27",
        stage: "Stage 1 Interview"
    },
    {
        company: "Veeva Systems",
        position: "Frontend Developer",
        interviewDate: "2026-04-27",
        stage: "Stage 1 Interview"
    }]


    const buildImportantJobBox = (jobInfo) => {
        return (
        <div style={{ height: '140px', background: '#07c5b5', border: '1px solid black', margin: '5px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', height: '70px', width: '100%'}}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '100px', margin: '5px', width: '100%' }}>
                    <div>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <p style={{margin: '0px', fontSize: '28px', width: '100%', textAlign: 'left'}}>{jobInfo.company}</p>
                            <FaStar style={{ color: "orange", marginTop: '10px', marginLeft: '10px' }} />
                        </div>

                        <p style={{margin: '0px', fontSize: '20px', textAlign: 'left'}}>{jobInfo.position}</p>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '3px', margin: '5px', textAlign: 'right'}}>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '3px', textAlign: 'right'}}>
                                <p style={{margin: '0px', fontSize: '15px', textAlign: 'right'}}> Interview Date: {jobInfo.interviewDate} </p>
                                <input type="date" value={jobInfo.interviewDate || ""} onChange={(e) => {console.log(e.target.value);}}
                                        style={{ width: '18px', height: '20px', padding: 0, border: 'none', color: 'transparent', cursor: 'pointer' }}/>
                            </div>

                            <div style={{display: 'flex', flexDirection: 'row', gap: '3px', margin: '5px', width: '100%', justifyContent: 'right'}}>
                                <p style={{margin: '0px', fontSize: '15px'}}>Stage:</p>
                                <select onChange={(e) => console.log(e.target.value)}>
                                    <option value="applied">Applied</option>
                                    <option value="initial">Initial Recruiter Call</option>
                                    <option value="stage1">Stage 1 Interview</option>
                                    <option value="stage2">Stage 2 Interview</option>
                                    <option value="stage3">Stage 3 Interview</option>
                                    <option value="awaitingOffer">Awaiting Offer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ height: '70px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{width: '10%', margin: '5px', textAlign: 'right'}}>Notes: </p>
                <input style={{height: '80%', width: '95%'}} />
            </div>

        </div>
    )};



    return (
        <div className='modernImportantJobsContainer'>
            <p className='modernImportantJobsTitle'> Important Interviews </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '3px'}}>

                {importantJobsData.map((jobInfo) => buildImportantJobBox(jobInfo))}

            </div>
        </div>
    );
};
export default Modern_ImportantJobs;