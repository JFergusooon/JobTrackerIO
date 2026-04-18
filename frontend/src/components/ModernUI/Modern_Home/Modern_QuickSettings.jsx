import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';
import LegacyToggle from '../../LegacyUI/Legacy_Plus/LegacyToggle';

const Modern_QuickSettings = ({text, closePopup}) => {


    return (
        <div className='modernQuickSettingsContainer'>
            <p className='modernQuickSettingsTitle'> Quick Settings </p>
            <div className='modernQuickSettingsButtonContainer'>
                <div className='modernQuickSettingsButton'>Add New List</div>
                <div className='modernQuickSettingsButton'>---</div>
                <div className='modernQuickSettingsButton'>---</div>
                <div className='modernQuickSettingsButton'>---</div>
                <div className='modernQuickSettingsButton'><LegacyToggle /></div>
            </div>
        </div>
    );
};
export default Modern_QuickSettings;