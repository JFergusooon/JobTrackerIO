import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import '../../css/HomePageCSS.css';

const RecentLists = ({text, closePopup}) => {


    return (
        <div className='recentListsContainer'>
            <p className='recentListsTitle'> Recent Lists </p>
            <div className='recentListsButtonContainer'>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='recentListsButton'>List #1</div>
                    <div className='recentListsButton'>List #2</div>
                    <div className='recentListsButton'>List #3</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='recentListsButton'>List #4</div>
                    <div className='recentListsButton'>List #5</div>
                    <div className='recentListsButton'>List #6</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='recentListsButton'>List #7</div>
                    <div className='recentListsButton'>List #8</div>
                    <div className='recentListsButton'>List #9</div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className='recentListsButton'>List #10</div>
                    <div className='recentListsButton'>List #11</div>
                    <div className='recentListsButton'>List #12</div>
                </div>
            </div>
        </div>
    );
};
export default RecentLists;