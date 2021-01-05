import React, { Fragment, useState, useEffect } from 'react';
import { AlertTickIcon } from './SVG';
import './AlertBox.css';

export default ({ infoMessage, closeAlert, style = {} }) => {
    const [variant, setVariant] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (infoMessage) {
            setVariant(infoMessage.variant);
            setMessage(infoMessage.message);
        } else {
            setVariant('');
            setMessage('');
        }
    }, [infoMessage]);

    return (<Fragment>
        {infoMessage && <div className={`alert-box ${variant}`} style={style}>
            {variant === 'success' && <span>
                <AlertTickIcon className="tick-icon" />
            </span>}
            <span className="message">{message}</span>
            <span className="close-icon" onClick={() => closeAlert(null)}>
                <svg className="alert-close"
                    xmlns="http://www.w3.org/2000/svg" width="13.928" height="12.15" viewBox="0 0 13.928 12.15">
                    <path d="M13.963-.7H10.938L6.911-5.669,2.852-.7H.035L5.371-7,.376-12.85H3.3l3.719,4.6,3.719-4.6h2.838L8.55-6.966Z"
                        transform="translate(-0.035 12.85)" />
                </svg>
            </span>
        </div>}
    </Fragment>);
};
