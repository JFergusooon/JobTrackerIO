import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../../css/Modern_HomePageCSS.css';

const Modern_RecentLists = ({text, closePopup}) => {


    return (
        <div className='modernRecentListsContainer'>
            <p className='modernRecentListsTitle'> Recent Lists </p>
            <div className='modernRecentListsButtonContainer'>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #1</div>
                    <div className='modernRecentListsButton'>List #2</div>
                    <div className='modernRecentListsButton'>List #3</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #4</div>
                    <div className='modernRecentListsButton'>List #5</div>
                    <div className='modernRecentListsButton'>List #6</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #7</div>
                    <div className='modernRecentListsButton'>List #8</div>
                    <div className='modernRecentListsButton'>List #9</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='modernRecentListsButton'>List #10</div>
                    <div className='modernRecentListsButton'>List #11</div>
                    <div className='modernRecentListsButton'>List #12</div>
                </div>
            </div>
        </div>
    );
};
export default Modern_RecentLists;