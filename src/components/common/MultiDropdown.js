import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';
import useOnClickOutside from './OutsideHandler';
import { ArrowUpIcon, ArrowDownIcon, RemoveIcon } from './SVG';
import './MultiDropdown.css';

const defaultOptions = [
    {
        ID: "item1",
        Name: "Item1"
    },
    {
        ID: "item2",
        Name: "Item2"
    },
    {
        ID: "item3",
        Name: "Item3"
    },
    {
        ID: "item4",
        Name: "Item4"
    },
    {
        ID: "item5",
        Name: "Item5"
    },
];

const MultiDropdown = ({ options, label, isRequired, placeholder, onChange, value = [], disabled = false, searchOptionRequired }) => {
    const [selectedValue, setSelectedValue] = useState(value);
    const [requiredList, setRequiredList] = useState(options);
    const [searchText, setSearchText] = useState('');
    const getSVT = (value) => {
        let sVT = [];
        if (value && value.length && options && options.length) {
            sVT = options && options.reduce((accum, op) => {
                if (value.includes(op.ID)) {
                    accum.push(op.Name);
                }
                return accum;
            }, [])
        }

        return sVT;
    }

    const [selectedValueText, setSelectedValueText] = useState(getSVT(value));

    const [showDropdownValue, setShowDropdownValue] = useState(false);
    const multiOpt = useRef();



    useEffect(() => {
        setSelectedValue(value);
        setSelectedValueText(getSVT(value));
    }, [value]);

    useEffect(() => {
        dropdownFilter()
    }, [searchText]);

    useEffect(() => {
        if (showDropdownValue) {
            setRequiredList(options);
        }
    }, [showDropdownValue]);
    const getPlaceholder = placeholder || "Select option(s)";
    const getLabel = label || '\u00A0';

    const handleClick = () => {
        setSearchText('');
        if (disabled) {
            return false;
        }
        setShowDropdownValue(!showDropdownValue);
    }

    useOnClickOutside(multiOpt, () => setShowDropdownValue(false));

    const addremoveItem = (e, id) => {
        if (e.target.checked) {
            setSelectedValue(() => {
                const valueArray = [...selectedValue, id];

                setSelectedValueText([...selectedValueText, options.find(o => o.ID === id).Name]);

                onChange(valueArray);

                return valueArray;
            });
        } else {
            setSelectedValue(() => {
                const valueArray = [...(selectedValue.filter(value => value !== id))];

                setSelectedValueText(options.reduce((accum, { ID, Name }) => {
                    if (valueArray.includes(ID)) {
                        accum.push(Name);
                    }
                    return accum;
                }, []))

                onChange(valueArray);

                return valueArray;
            });
        }
    }
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
    const handleChange = () => {
        //debugger;
    }
    // clear search text
    const clearSearch = () => {
        setSearchText('')
    }
    return (
        <div className="MA_Dropdown" ref={multiOpt}>
            <label className="MA_FieldLabel">{getLabel}{isRequired && <span className="asterisk-multi">*</span>}</label>
            <div className="MA_DropdownText" onClick={handleClick}>
                <input type="text"
                    name="droptxt"
                    placeholder={getPlaceholder}
                    value={selectedValueText}
                    onChange={handleChange}
                    autoComplete="off"
                    readOnly
                />
                {showDropdownValue
                    ? <span><ArrowUpIcon /></span>
                    : <span><ArrowDownIcon /></span>}
            </div>
            {showDropdownValue ? <div className="MA_DropdownOption_container">
                <ul className="MA_DropdownOptionsList">
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

                    {requiredList && requiredList.sort((a, b) => {
                        const nameA = a.Name.toUpperCase();
                        const nameB = b.Name.toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }

                        return 0;
                    }).map(({ ID, Name, disabled = false }) => {
                        const isChecked = selectedValue.includes(ID);

                        return (
                            <li
                                // style={{ margin: '5px' }} 
                                key={ID}
                                className="MA_DropdownOption"
                            >
                                <label
                                    className="MA_CheckOptionContainer"
                                >
                                    <input type="checkbox"
                                        // style={{ margin: '0.5rem' }}
                                        checked={isChecked} onChange={e => addremoveItem(e, ID)} disabled={disabled} />
                                    {Name}
                                    <span className={`checkmark ${disabled ? "disabledChkBox" : ""}`}></span>
                                </label>
                            </li>
                            // <li className="MA_DropdownOption" value={ID}>
                            //     <label className="MA_CheckOptionContainer">{Name}
                            //         <input type="checkbox" checked={isChecked} onClick={e => addremoveItem(e, ID)} />
                            //         <span className="checkmark"></span>
                            //     </label>
                            // </li>
                        );
                    })}
                </ul>
            </div>
                : null}
        </div>
    );
}
export default MultiDropdown;