import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BackToIcon } from './SVG';
import './BackPage.css';

export default ({ label, onClickBack }) => {
    return (
        <div>
            <a onClick={onClickBack} className="back-to-icon">
        
                <BackToIcon />
                <span className="label-icon">
                    {label}
                </span>
            </a>
        </div>
    );
};