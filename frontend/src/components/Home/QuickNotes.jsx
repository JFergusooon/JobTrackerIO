import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

const QuickNotes = ({text, closePopup}) => {


    return (
        <div className='quickNotesContainer'>
            <p className='quickNotesTitle'> Quick Notes </p>
            <input className='quickNotesInput'></input>
        </div>
    );
};
export default QuickNotes;