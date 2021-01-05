import React from 'react';
import './Button.css';

export default ({
    onClick,
    caption = 'Media Annex Button',
    variant,
    className = '',
    disabled
}) => {
    return (
        <button
            className={disabled ? `${className} ${variant} MA_ButtonDisabled` : `${className} ${variant} `}
            disabled={disabled}
            onClick={onClick}
        >
            <span>{caption}</span>
        </button>
    );
}
