import React, { useState, useRef } from 'react';
import { InfoIcon } from '../../components/common/SVG';
import './TextField.css';
import Tooltip from './Tooltip';
import { Overlay } from 'react-bootstrap';

export default ({ type, onChange, value, placeholder, isRequired, label, isInfoDisplayed, infoText,
    className = "truncate-text", title, style, isNumber, readOnly, isCurrency, noFormat
}) => {
    const props = {
        type,
        placeholder,
        value,
        className,
        title: title || value,
        style,
        readOnly,
        autoComplete: 'off'
    };

    const [showError, setShowError] = useState(false);
    const target = useRef(null);
    const [savedValue, setSavedValue] = useState('');
    const checkInputVal = (e) => {
        if (isNumber) {  //&& e.target.value != '' && isNaN(parseInt(e.target.value))) {
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
            }, 1500)
        }
        //onChange(e);
    }
    const validateInput = (e) => {
        let value = e.target.value;
        let checkPattern = isCurrency ? /^[0-9,]+(\.[0-9]{0,2})?$/ : /^[0-9,]+$/;
        if (noFormat && value && isNumber) {
            value = value.match(/^[0-9]+$/) ? value : savedValue;
        } else if (isNumber && value) {
            value = value.match(checkPattern) ? value : savedValue; // to remove the last entered char incase of alphabet/decimal
        }
        setSavedValue(value);
        onChange({
            target: {
                value: value
            }
        })
    }
    const formatInput = (e) => {
        let value = e.target.value;
        if (value && !noFormat && (isCurrency || isNumber)) {
            value = value.replace(/,/g, "");
            if (isCurrency) {
                value = parseFloat(value).toFixed(2); // to have two decimal digits
            }
            value = value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            setSavedValue(value);
            onChange({
                target: {
                    value: value
                }
            })
        }
    };
    return (
        <div>
            <div className={'textField ' + (isCurrency ? 'input-dollar' : '')} ref={target}>
                <input {...props} onClick={e => e.target.focus()} onFocus={checkInputVal} onChange={e => validateInput(e)} onBlur={e => formatInput(e)} />
                <label className="MA_TextFieldLabel_Container">
                    {label} {isRequired && <span className="asterisk">*</span>}
                    {isInfoDisplayed &&
                        <span className="InfoIconContainer">
                            {infoText &&
                                <span className="Tooltip_container">
                                    <Tooltip message={infoText} />
                                </span>
                            }
                            <InfoIcon style={{ fill: '#004eb4', paddingLeft: '5px', width: '1rem', marginBottom: '0.5rem' }} />
                        </span>}
                </label>
            </div>
            <Overlay
                target={target.current}
                show={showError}
                placement="bottom"
                onHide={() => { }}>
                {({
                    placement,
                    scheduleUpdate,
                    arrowProps,
                    outOfBoundaries,
                    show: _show,
                    ...props
                }) => (
                        <div
                            {...props}
                            className="textField-error"
                        >
                            <span>Only numbers allowed.</span>
                        </div>
                    )}
            </Overlay>
        </div>
    );
}