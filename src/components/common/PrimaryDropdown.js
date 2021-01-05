import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';
import useOnClickOutside from './OutsideHandler';
import { ArrowUpIcon, ArrowDownIcon, RemoveIcon } from './SVG';
import './PrimaryDropdown.css';

const PrimaryDropdown = ({ options, label, value, isRequired, placeholder, onChange, isInfoDisplayed, style, searchOptionRequired, listHeight }) => {
    const [selectedValue, setSelectedValue] = useState(value || '');
    const [selectedText, setSelectedText] =
        useState((options && options.find(o => o.ID === value)) ? options.find(o => o.ID === value).Name : '');
    const [requiredList, setRequiredList] = useState(options);
    const [searchText, setSearchText] = useState('');
    const [showDropdownValue, setShowDropdownValue] = useState(false);
    const [dropdownUp, setDropdownUp] = useState(false);
    const primary = useRef();
    const getPlaceholder = placeholder || "Select";

    const getLabel = label || '\u00A0';

    useEffect(() => {
        setSelectedValue(value || '');
        setSelectedText((options && options.find(o => o.ID === value)) ? options.find(o => o.ID === value).Name : '');
    }, [value]);

    // useEffect(() => {
    //     if (value && options) {
    //         setSelectedValue(value);

    //         setSelectedText((options && options.find(o => o.ID === value)) ? options.find(o => o.ID === value).Name : '');
    //     }
    // }, [value, options]);

    const handleClick = (e) => {
        setSearchText('');
        setShowDropdownValue(!showDropdownValue);

    };

    const handleChange = (e) => {
        setSelectedValue(e.target.value);
    };
    useEffect(() => {
        dropdownFilter()
    }, [searchText]);

    useEffect(() => {
        if (showDropdownValue) {
            setRequiredList(options);
        }
    }, [showDropdownValue]);
    useOnClickOutside(primary, () => setShowDropdownValue(false));
    // Fliter required list with avilable search 
    const dropdownFilter = () => {
        let val = searchText;
        let reqOptios = [];
        if (val && val.length && options && options.length) {
            reqOptios = options && options.filter((option, index) => {
                return option.Name.toUpperCase().includes(val.toUpperCase())
            }, [])
            setRequiredList(reqOptios);
        }
        else {

            setRequiredList(options);
        }
    }
    // clear search text
    const clearSearch = () => {
        setSearchText('')
    }
    const handleSelectItem = (e) => {
        // const value = e.target.value;
        const text = e.target.innerHTML;

        setSelectedValue(() => {
            // TODO...
            let tempValue = '';
            if (text) {
                let temp = options.find(o => o.Name === text);
                tempValue = temp ? options.find(o => o.Name === text).ID : '';
            }

            onChange({
                target: {
                    value: tempValue,
                    currentObject: options.find(o => o.ID === tempValue)
                }
            });

            return tempValue;
        });

        setSelectedText(e.target.innerHTML);
        setShowDropdownValue(!showDropdownValue);
    };

    return (
        <div className="MA_Dropdown" ref={primary}>
            <label className="MA_FieldLabel">
                {getLabel} {isRequired && <span className="asterisk-color">*</span>}
                {isInfoDisplayed && <InfoIcon style={{ fill: '#004eb4', paddingLeft: '5px' }} />}
            </label>
            <div className="MA_DropdownText" onClick={handleClick}>
                <input type="text"
                    name="droptxt"
                    placeholder={getPlaceholder}
                    value={selectedText}
                    onChange={onChange || handleChange}
                    autoComplete="off"
                    style={style}
                    readOnly
                />
                {showDropdownValue
                    ? <span><ArrowUpIcon /></span>
                    : <span><ArrowDownIcon /></span>
                }
            </div>
            {showDropdownValue ? <div className='MA_DropdownOption_container'>
                <ul className={'MA_DropdownOptionsList ' + (listHeight ? listHeight : '')}>
                    {searchOptionRequired ? <span>
                        <input type="text"
                            name="search"
                            placeholder={"Search"}
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                            }}
                            autoComplete="off"
                            className="MA_Search"
                        />
                        {searchText ? <span onClick={clearSearch}>
                            <RemoveIcon className='closeSearchIcon' />
                        </span> : null}
                    </span> : null}

                    <li className="MA_DropdownOption"
                        // style={{ backgroundColor: `${selectedValue === '' ? '#e5f0f7' : 'inherit'}` }}
                        onClick={handleSelectItem}
                        value={''}
                    >
                        {''}
                    </li>
                    {requiredList && requiredList.length > 4 && requiredList.sort((a, b) => {
                        const nameA = a.Name.toUpperCase();
                        const nameB = b.Name.toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }

                        return 0;
                    }).map(({ ID, Name }, i) =>
                        <li className="MA_DropdownOption"
                            style={{ backgroundColor: `${selectedValue === ID ? '#e5f0f7' : ''}` }}
                            onClick={handleSelectItem}
                            value={ID} key={i}
                        >
                            {Name}
                        </li>
                    )}
                    {requiredList && requiredList.length <= 4 && requiredList.map(({ ID, Name }, i) =>
                        <li className="MA_DropdownOption"
                            style={{ backgroundColor: `${selectedValue === ID ? '#e5f0f7' : ''}` }}
                            onClick={handleSelectItem}
                            value={ID} key={i}
                        >
                            {Name}
                        </li>
                    )}
                </ul>
            </div> : null}
        </div>
    );
}
export default PrimaryDropdown;