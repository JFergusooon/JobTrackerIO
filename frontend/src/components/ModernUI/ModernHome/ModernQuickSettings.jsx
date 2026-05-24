import React from 'react';
import '../../../css/Modern_HomePageCSS.css';

const ModernQuickSettings = ({onOpenUpdates, onOpenNewList, onOpenFeedback}) => {


    return (
        <div className='modernQuickSettingsContainer'>
            <p className='modernQuickSettingsTitle'> Quick Settings </p>
            <div className='modernQuickSettingsButtonContainer'>
                <div className='modernQuickSettingsButton' onClick={onOpenNewList}>Add New List</div>
                <div className='modernQuickSettingsButton' onClick={onOpenUpdates}>Updates</div>
                <div className='modernQuickSettingsButton'>---</div>
                <div className='modernQuickSettingsButton'>---</div>
                <div className='modernQuickSettingsButton' onClick={onOpenFeedback}>Feedback</div>
            </div>
        </div>
    );
};
export default ModernQuickSettings;