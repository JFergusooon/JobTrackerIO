import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

const QuickSettings = ({text, closePopup}) => {


    return (
        <div className='quickSettingsContainer'>
            <p className='quickSettingsTitle'> Quick Settings </p>
            <div className='quickSettingsButtonContainer'>
                <div className='quickSettingsButton'>Add New List</div>
                <div className='quickSettingsButton'>---</div>
                <div className='quickSettingsButton'>---</div>
                <div className='quickSettingsButton'>---</div>
                <div className='quickSettingsButton'>---</div>
            </div>
        </div>
    );
};
export default QuickSettings;