import React from 'react';

export default (props) => {
    return (
        <>
            {props.notes && props.notes.length > 0 && props.notes.map((note) => {
                return <>
                    <p className='modifiedNoteLbl'>Modified by: <span className='modifiedNote'>{note[0]}</span></p>
                    <p className='modifiedNoteLbl'>Notes: <span className='modifiedNote'>{note[1]}</span></p>
                </>
            })
            }
        </>
    );
}