import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import '../../../css/Modern_HomePageCSS.css'
import LegacyToggle from '../../LegacyUI/Legacy_Plus/LegacyToggle.jsx';
import Modern_ProfileBox from '../Modern_Home/Modern_ProfileBox.jsx';
import Modern_QuickSettings from '../Modern_Home/Modern_QuickSettings.jsx';
import Modern_QuickNotes from '../Modern_Home/Modern_QuickNotes.jsx';
import Modern_ImportantJobs from '../Modern_Home/Modern_ImportantJobs.jsx';
import Modern_RecentLists from '../Modern_Home/Modern_RecentLists.jsx';
import Modern_StatsChart from '../Modern_Home/Modern_StatsChart.jsx';
import Modern_StatsInfo from '../Modern_Home/Modern_StatsInfo.jsx';
import ModernFooterComponent from '../../ModernFooter.jsx';

function ModernUI_Home() { 

  const [allJobs, setAllJobs] = useState([]);

  const [userInfo, setUserInfo] = useState();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchAllJobs = async () => {
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Jobs/getByUsername?username=${localStorage.getItem("username")}`;
        const encode = window.btoa("admin:admin");

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': 'Basic ' + encode },
                method: "GET"
            });

            const data = await res.json();
            setAllJobs(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAllJobs();
    }, []);

    useEffect(() => {
            let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
            let url = stage_url + "/Users/getByUsername?username=" + localStorage.getItem('username')
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
                        setUserInfo(result);
                    },
                    (error) => {
                        setIsLoaded(true);
                        setError(error);
                    }
                )
        }, [])
    



    return (
        <div className='modernHomeContainer'>
            
          {/* Left Column */}
          <div style={{display: 'flex', flexDirection: 'column', 
                    gap: '10px'
                    , padding: '5px'
          }}>
            <Modern_ProfileBox userData={userInfo} />
            
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{width: '55%'}}>
              </div>
              <div style={{width: '45%', height: '100%'}}>
                  <Modern_QuickSettings />
                  <Modern_QuickNotes userData={userInfo} />
              </div>
            </div>
            
          </div>
          
          {/* Middle Column */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <Modern_ImportantJobs />
            <Modern_RecentLists />
          </div>

          {/* Right Column */} 
          <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
            <Modern_StatsChart allJobs={allJobs} />
            <Modern_StatsInfo rejectedCount={allJobs} />
          </div>
        </div>
    );
};

export default ModernUI_Home;