import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';

const Modern_QuickNotes = ({text, closePopup}) => {


    return (
        <div className='modernQuickNotesContainer'>
            <p className='modernQuickNotesTitle'> Quick Notes </p>
            <input className='modernQuickNotesInput'></input>
        </div>
    );
};
export default Modern_QuickNotes;