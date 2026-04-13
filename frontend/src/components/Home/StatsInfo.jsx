import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

const StatsInfo = ({}) => {
    const [totalAppliedThisMonth, setTotalAppliedThisMonth] = useState("XXX");
    const [totalRejectedThisMonth, setTotalRejectedThisMonth] = useState("XXX");
    const [totalJobsStageTwo, setTotalJobsStageTwo] = useState("XXX");
    const [totalJobsStageThree, setTotalJobsStageThree] = useState("XXX");

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
            let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
            let url = stage_url + "/Jobs/getByMonth?username=" + localStorage.getItem('username') + "&month=04"
            let encode = window.btoa("admin:admin");
            fetch(url, {
                headers: {
                    'Authorization':  'Basic ' + encode
                }}    
            )
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log("getting all applications from this month: " + JSON.stringify(result));
                        setIsLoaded(true);
                        setTotalAppliedThisMonth(result.length);
                    },
                    (error) => {
                        setIsLoaded(true);
                        setError(error);
                    }
                )
        }, [])



    return (
        <div className='statsInfoContainer'>
            <p className='statsInfoTitle'> Stats </p>
            <p>Total Applied This Month: {totalAppliedThisMonth}</p>
            <p>Total Rejected This Month: {totalRejectedThisMonth}</p>
            <p>Jobs in stage 2: {totalJobsStageTwo}</p>
            <p>Jobs in stage 3: {totalJobsStageThree}</p>
        </div>
    );
};
export default StatsInfo;