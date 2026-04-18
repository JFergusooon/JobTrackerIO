import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Legacy_HomePageCSS.css';

const Legacy_QuickNotes = ({text, closePopup}) => {


    return (
        <div className='quickNotesContainer'>
            <p className='quickNotesTitle'> Quick Notes </p>
            <input className='quickNotesInput'></input>
        </div>
    );
};
export default Legacy_QuickNotes;