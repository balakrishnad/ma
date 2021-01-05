import React from 'react';
export default (props) => {
    const { timeBar } = props;
    return (
        <div className="tl-layout-track-row">
            {[...Array(4)].map((x, i) => {
            return <div key={i + '-track-col'} className='tl-layout-track-col'> </div>
            })}
        </div>
    );
}