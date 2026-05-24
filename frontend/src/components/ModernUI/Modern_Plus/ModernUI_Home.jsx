import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Modern_HomePageCSS.css'
import LegacyToggle from '../../LegacyUI/Legacy_Plus/LegacyToggle.jsx';
import Modern_ProfileBox from '../Modern_Home/Modern_ProfileBox.jsx';
import Modern_QuickSettings from '../Modern_Home/Modern_QuickSettings.jsx';
import Modern_QuickNotes from '../Modern_Home/Modern_QuickNotes.jsx';
import Modern_ImportantJobs from '../Modern_Home/Modern_ImportantJobs.jsx';
import Modern_RecentLists from '../Modern_Home/Modern_RecentLists.jsx';
import Modern_StatsChart from '../Modern_Home/Modern_StatsChart.jsx';
import Modern_StatsInfo from '../Modern_Home/Modern_StatsInfo.jsx';
import Modern_NewListPopup from '../Modern_Tracker/Modern_NewListPopup.jsx';
import Modern_FeedbackPopup from '../Modern_Tracker/Modern_FeedbackPopup.jsx';
import ModernFooterComponent from '../../ModernFooter.jsx';
import ProfileSetupPopup from '../../ProfileSetupPopup.jsx';

const normalizeCareerTitleValue = (careerTitleValue) => {
    if (typeof careerTitleValue === 'string') {
        return careerTitleValue;
    }

    if (Array.isArray(careerTitleValue)) {
        return careerTitleValue.join(',');
    }

    if (careerTitleValue == null) {
        return '';
    }

    return String(careerTitleValue);
};

const isMissingRequiredProfileFields = (user) => {
    const normalizedCareerTitle = normalizeCareerTitleValue(user?.careerTitle)
        .replace(/[{}"]/g, '')
        .trim();

    const normalizedLocation = typeof user?.location === 'string'
        ? user.location.trim()
        : '';

    return !normalizedCareerTitle || !normalizedLocation;
};

function ModernUI_Home({ onOpenUpdates }) { 
    const navigate = useNavigate();

  const [allJobs, setAllJobs] = useState([]);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [showProfileSetupPopup, setShowProfileSetupPopup] = useState(false);
  const [userInfo, setUserInfo] = useState();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const normalizeCompanyKey = (name) => (name ?? '').trim().toLowerCase();

  const handleFavoriteChanged = (companyName, nextFavorited) => {
        setAllJobs((prevJobs) => {
            if (!Array.isArray(prevJobs)) return prevJobs;
            return prevJobs.map((job) => {
                const jobCompanyName = job.companyName ?? job.company;

                if (normalizeCompanyKey(jobCompanyName) !== normalizeCompanyKey(companyName)) {
                    return job;
                }

                return {
                    ...job,
                    favorite: nextFavorited,
                    favorited: nextFavorited,
                };
            });
        });
  };

  const handleStageChanged = (companyName, newStage) => {
        setAllJobs((prevJobs) => {
            if (!Array.isArray(prevJobs)) return prevJobs;
            return prevJobs.map((job) => {
                const jobCompanyName = job.companyName ?? job.company;

                if (normalizeCompanyKey(jobCompanyName) !== normalizeCompanyKey(companyName)) {
                    return job;
                }

                return {
                    ...job,
                    stage: newStage,
                };
            });
        });
  };

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

        const toggleNewListPopup = () => {
            setShowNewListPopup(!showNewListPopup);
        };

        const onOpenFeedback = () => {
            setShowFeedbackPopup(!showFeedbackPopup);
        };

    const closeProfileSetupPopup = () => {
        const username = localStorage.getItem('username') || '';
        if (username) {
            localStorage.setItem(`profile-setup-prompt-seen:${username}`, 'true');
        }
        setShowProfileSetupPopup(false);
    };

    const onGoToSettingsFromProfilePrompt = () => {
        closeProfileSetupPopup();
        navigate('/settings');
    };

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
                                                const sourceUser = result?.body || result;
                                                const username = sourceUser?.username || localStorage.getItem('username') || '';
                                                const hasSeenPrompt = username
                                                    ? localStorage.getItem(`profile-setup-prompt-seen:${username}`) === 'true'
                                                    : false;

                                                if (!hasSeenPrompt && isMissingRequiredProfileFields(sourceUser)) {
                                                    setShowProfileSetupPopup(true);
                                                }

                        setIsLoaded(true);
                                                setUserInfo(sourceUser);
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
                  <Modern_QuickSettings onOpenUpdates={onOpenUpdates} onOpenNewList={toggleNewListPopup} onOpenFeedback={onOpenFeedback} />
                  <Modern_QuickNotes userData={userInfo} />
              </div>
            </div>
            
          </div>
          
          {/* Middle Column */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                                <Modern_ImportantJobs importantJobsList={allJobs} onFavoriteChanged={handleFavoriteChanged} onStageChanged={handleStageChanged} />
            <Modern_RecentLists />
          </div>

          {/* Right Column */} 
          <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
            <Modern_StatsChart allJobs={allJobs} />
            <Modern_StatsInfo allJobs={allJobs} />
          </div>

                    {showNewListPopup ? <Modern_NewListPopup text='NewList' closePopup={toggleNewListPopup} /> : null }
                    {showFeedbackPopup ? <Modern_FeedbackPopup closePopup={onOpenFeedback} /> : null }
                    {showProfileSetupPopup ? <ProfileSetupPopup closePopup={closeProfileSetupPopup} onGoToSettings={onGoToSettingsFromProfilePrompt} /> : null }
        </div>
    );
};

export default ModernUI_Home;