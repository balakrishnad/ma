import React from 'react';
import './SwitchButton.css';

export default (props) => {
    return (
        <div className='custom-control custom-switch'>
            <input
                type='checkbox'
                className='custom-control-input'
                id='customSwitchesChecked'
                onChange={props.onChange}
                checked={props.checked}
            />
            <label className='custom-control-label' htmlFor='customSwitchesChecked'>{props.inpLabel}</label>
        </div>
    );
}