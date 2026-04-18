import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Legacy_HomePageCSS.css';
import LegacyToggle from '../Legacy_Plus/LegacyToggle';

const Legacy_QuickSettings = ({text, closePopup}) => {


    return (
        <div className='quickSettingsContainer'>
            <p className='quickSettingsTitle'> Quick Settings </p>
            <div className='quickSettingsButtonContainer'>
                <div className='quickSettingsButton'>Add New List</div>
                <div className='quickSettingsButton'>---</div>
                <div className='quickSettingsButton'>---</div>
                <div className='quickSettingsButton'>---</div>
                <div className='quickSettingsButton'><LegacyToggle /></div>
            </div>
        </div>
    );
};
export default Legacy_QuickSettings;