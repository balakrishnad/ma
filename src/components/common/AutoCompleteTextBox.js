import React, { useState, useRef, useEffect } from 'react';
import useOnClickOutside from './OutsideHandler';
import './Dropdown.css';
import Axios from 'axios';
import { RemoveIcon } from '.';
import './AutoCompleteTextBox.css';

const AutoCompleteTextBox = ({ dataUrl, label, isRequired, placeholder, isInfoDisplayed, callBack, onChange, value, closeOnLoading }) => {
    const [options, setOptions] = useState([]);
    const [noData, setNoData] = useState(true);
    const [noDataText, setNoDataText] = useState('');
    const [selectedText, setSelectedText] = useState(value || '');
    const [userSelected, setUserSelected] = useState(false);
    const [showDropdownValue, setShowDropdownValue] = useState(false);
    const [isCloseOnLoad, setIsCloseOnLoad] = useState(false);
    const primary = useRef();
    const getPlaceholder = placeholder || "";
    const getLabel = label || '\u00A0';
    const isFirstRun = useRef(true);
    let isSelectItem = useRef(false);

    useEffect(() => {
        if (!closeOnLoading) {
            setIsCloseOnLoad(false);
        } else {
            setIsCloseOnLoad(closeOnLoading);
        }
    }, [value]);

    useEffect(() => {
        if (isFirstRun.current || selectedText.length < 4) {
            isFirstRun.current = false;
            setOptions([]);
            setNoDataText('Enter atleast 4 characters for suggestions.');
            setNoData(true);
            return;
        }

        setNoData(true);
        setOptions([]);
        setNoDataText('Loading...');
        if (!isSelectItem.current) {
            setShowDropdownValue(true);
        } else {
            isSelectItem.current = false;
        }
        Axios({
            url: dataUrl + selectedText + '/',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        }).then(res => {
            let userData = [];
            if (res.data && res.data.length != 0) {
                userData = res.data.map((d, i) => ({
                    ID: i,
                    Name: d.displayName,
                    firstName: d.givenName,
                    lastName: d.surName,
                    email: d.mail
                }));
                setOptions(userData);
                setNoData(false);
            } else {
                setOptions(userData);
                setNoDataText('No such user found in the system');
            }
        }).catch(error => {
            setNoData(false);
            console.log('fetching dropdowns', error);
        });
    }, [selectedText]);

    useEffect(() => {
        if (!value) {
            setSelectedText('');
            setUserSelected(false);
        } else {
            setSelectedText(value);
            setUserSelected(true);
        }
    }, [value]);

    const handleClick = () => {
        if (options.length != 0 || (noData && !userSelected)) {
            setShowDropdownValue(!showDropdownValue);
        }
    };

    const handleChange = (e) => {
        setSelectedText(e.target.value);
        if (isCloseOnLoad) {
            setIsCloseOnLoad(false);
        }
    };

    useOnClickOutside(primary, () => setShowDropdownValue(false));

    const handleSelectItem = (e) => {
        setSelectedText(e.target.innerHTML);
        setShowDropdownValue(false);
        isSelectItem.current = true;
        if (callBack) {
            callBack(options[e.target.value]);
        }
        onChange(e.target.innerHTML);
        setUserSelected(true);
    };

    const clearText = () => {
        setSelectedText('');
        callBack({
            firstName: '',
            lastName: '',
            email: '',
            Name: ''
        })
        setUserSelected(false);
    };

    return (
        <div className="MA_Dropdown" ref={primary}>
            <label className="MA_FieldLabel">
                {getLabel} {isRequired && <span className="coloring">*</span>}
                {isInfoDisplayed && <InfoIcon className="padding"/>}
            </label>
            <div className="MA_DropdownText" onClick={handleClick}>
                <input type="text"
                    name="droptxt"
                    placeholder={getPlaceholder}
                    value={selectedText}
                    onChange={handleChange}
                    autoComplete="off"
                    className='auto-complete-textbox'
                    title={selectedText}
                    disabled={userSelected}
                />
                {selectedText && <span className='auto-complete-text-clear' onClick={clearText}><RemoveIcon /> </span>}
            </div>
            {(showDropdownValue && !isCloseOnLoad) ? <div className="MA_DropdownOption_container">
                <ul className="MA_DropdownOptionsList">
                    {options && options.map(({ ID, Name }, i) =>
                        <li className="MA_DropdownOption"
                            onClick={handleSelectItem}
                            value={ID} key={i}
                        >
                            {Name}
                        </li>
                    )}
                    {noData && <span className="no-data-container">{noDataText}</span>}
                </ul>
            </div> : null}
        </div>
    );
}
export default AutoCompleteTextBox;