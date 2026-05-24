import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Modern_HomePageCSS.css';

const API_BASE = 'https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev';

const normalizeCareerTitle = (careerTitleValue) => {
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

const formatJoinedDate = (dateCreated) => {
    if (typeof dateCreated !== 'string' || !dateCreated.includes('/')) {
        return '';
    }

    const dateParts = dateCreated.split('/');
    if (dateParts.length < 3) {
        return '';
    }

    return `${dateParts[0]}/${dateParts[2]}`;
};

const ModernProfileBox = ({userData}) => {
    const navigate = useNavigate();

    const formattedCareerTitle = normalizeCareerTitle(userData?.careerTitle)
        .replace(/[{}"]/g, '')
        .split(',')
        .map((titlePart) => titlePart.trim())
        .filter(Boolean)
        .join(' | ');

    const joinedDate = formatJoinedDate(userData?.dateCreated);

    // Profile picture state
    const [profileImageUrl, setProfileImageUrl] = useState('');

    useEffect(() => {
        async function fetchProfileImage() {
            const fileName = userData?.profilePictureFileName;
            if (!fileName) {
                setProfileImageUrl('');
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/get-file?fileName=${encodeURIComponent(fileName)}`);
                const data = await res.json();
                setProfileImageUrl(data.url || '');
            } catch (err) {
                setProfileImageUrl('');
            }
        }
        fetchProfileImage();
    }, [userData?.profilePictureFileName]);

    return (
        <div className='modernProfileBoxContainer'>
            {/* Left Column */}
            <div style={{width: '20%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
                <div style={{ width: '90%', aspectRatio: '1 / 1', borderRadius: '50%', backgroundColor: 'var(--nav-background)', margin: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid var(--gradient-top-color)'}}>
                    {profileImageUrl ? (
                        <img src={profileImageUrl} alt='profile' style={{width: '90%', height: '90%', objectFit: 'cover', borderRadius: '50%'}} />
                    ) : (
                        <img src='person.png' alt='person' style={{width: '100%', height: '100%'}} />
                    )}
                </div>
                <p className='modernQuickSettingsButton' onClick={() => navigate('/settings')} style={{textAlign: 'center', margin: '2px 0 0 0', width: 'fit-content', padding: '1px 6px', cursor: 'pointer', fontSize: '12px', height: '15px'}}>Edit</p>
            </div>

            <div style={{width: '56%', textAlign: 'left', marginLeft: '5px', marginTop: '5px'}}>
                <p className='modernProfileBoxTitle'> {userData?.username} </p>
                <p style={{marginTop: '2px', fontSize: '20px', marginBottom: '0px'}}> {formattedCareerTitle} 
                </p>
                
                <p style={{margin: '0px', marginTop: '8px'}}>{userData?.location}</p>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', width: '24%', paddingRight: '16px'}}>
                {joinedDate ? <p style={{marginTop: '5px'}}>Joined {joinedDate}</p> : null}
            </div>
            
            
        </div>
    );
};
export default ModernProfileBox;