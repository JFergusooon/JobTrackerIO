import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Modern_HomePageCSS.css'
import LegacyToggle from '../../LegacyUI/Legacy_Plus/LegacyToggle.jsx';
import ModernProfileBox from '../ModernHome/ModernProfileBox.jsx';
import ModernQuickSettings from '../ModernHome/ModernQuickSettings.jsx';
import ModernQuickNotes from '../ModernHome/ModernQuickNotes.jsx';
import ModernImportantJobs from '../ModernHome/ModernImportantJobs.jsx';
import ModernRecentLists from '../ModernHome/ModernRecentLists.jsx';
import ModernStatsChart from '../ModernHome/ModernStatsChart.jsx';
import ModernStatsInfo from '../ModernHome/ModernStatsInfo.jsx';
import ModernNewListPopup from '../ModernTracker/ModernNewListPopup.jsx';
import ModernFeedbackPopup from '../ModernTracker/ModernFeedbackPopup.jsx';
import ModernFooterComponent from '../../ModernFooter.jsx';
import ModernProfileSetupPopup from '../ModernHome/ModernProfileSetupPopup.jsx';

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

function ModernUIHome({ onOpenUpdates }) { 
    const navigate = useNavigate();

  const [allJobs, setAllJobs] = useState([]);
    const [isJobsLoading, setIsJobsLoading] = useState(true);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [showProfileSetupPopup, setShowProfileSetupPopup] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState([]);
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
      setIsJobsLoading(true);
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Jobs/getByUsername?username=${localStorage.getItem("username")}`;
        const encode = window.btoa("admin:admin");

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': 'Basic ' + encode },
                method: "GET"
            });

            const data = await res.json();
            setAllJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setAllJobs([]);
        } finally {
            setIsJobsLoading(false);
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
                                                    const missing = [];
                                                    const normalizedTitle = normalizeCareerTitleValue(sourceUser?.careerTitle).replace(/[{}"]/g, '').trim();
                                                    const normalizedLocation = typeof sourceUser?.location === 'string' ? sourceUser.location.trim() : '';
                                                    if (!normalizedTitle) missing.push('career title');
                                                    if (!normalizedLocation) missing.push('location');
                                                    setMissingProfileFields(missing);
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
            <ModernProfileBox userData={userInfo} />
            
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{width: '55%'}}>
              </div>
              <div style={{width: '45%', height: '100%'}}>
                  <ModernQuickSettings onOpenUpdates={onOpenUpdates} onOpenNewList={toggleNewListPopup} onOpenFeedback={onOpenFeedback} />
                  <ModernQuickNotes userData={userInfo} />
              </div>
            </div>
            
          </div>
          
          {/* Middle Column */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                                <ModernImportantJobs importantJobsList={allJobs} importantJobsLoading={isJobsLoading} onFavoriteChanged={handleFavoriteChanged} onStageChanged={handleStageChanged} />
            <ModernRecentLists />
          </div>

          {/* Right Column */} 
          <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
            <ModernStatsChart allJobs={allJobs} />
            <ModernStatsInfo allJobs={allJobs} />
          </div>

                    {showNewListPopup ? <ModernNewListPopup text='NewList' closePopup={toggleNewListPopup} /> : null }
                    {showFeedbackPopup ? <ModernFeedbackPopup closePopup={onOpenFeedback} /> : null }
                    {showProfileSetupPopup ? <ModernProfileSetupPopup closePopup={closeProfileSetupPopup} onGoToSettings={onGoToSettingsFromProfilePrompt} missingFields={missingProfileFields} /> : null }
        </div>
    );
};

export default ModernUIHome;