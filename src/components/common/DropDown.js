import React, { useState } from 'react';
import './Dropdown.css';

const defaultOptions = [
    {
        value: "item1",
        label: "Item1"
    },
    {
        value: "item2",
        label: "Item2"
    },
    {
        value: "item3",
        label: "Item3"
    },
    {
        value: "item4",
        label: "Item4"
    },
    {
        value: "item5",
        label: "Item5"
    },
];

const getSelectedValue = (options, value) => {
    const option = options ? options.find(o => o.Name === value) : null;

    return option ? option.ID : '';
}

export default ({ label, value, onChange, options, placeholder = 'Select', }) => {
    const [selectedValue, setSelectedValue] = useState(getSelectedValue(options, value));
    const [showDropdownValue, setShowDropdownValue] = useState(false);
    const getPlaceholder = placeholder || "Select";
    const getMenuItems = options || defaultOptions;
    // const value = selectedValue;

    const handleClick = () => {
        setShowDropdownValue(!showDropdownValue);
    };

    const handleBlur = () => {
        //setShowDropdownValue(false);
    };

    const handleChange = (e) => {
        setSelectedValue(e.target.value);
    };

    const handleSelectItem = (e) => {
        setSelectedValue(e.target.innerHTML);
        setShowDropdownValue(!showDropdownValue);
        
        onChange({ target: { value: getSelectedValue(options, e.target.innerHTML) } })
    };

    return (
        <div className="MA_Dropdown" onBlur={handleBlur}>
            <label className="MA_FieldLabel">{label}</label>
            <div className="MA_DropdownText" onClick={handleClick}>
                {/* <label className ="MA_FieldLabel">{label}</label> */}
                <input type="text"
                    name="droptxt"
                    placeholder={getPlaceholder}
                    value={selectedValue}
                    onChange={onChange || handleChange}
                // onBlur={handleBlur}
                />
                {showDropdownValue
                    ? <span><i className='fas fa-angle-up' ></i></span>
                    : <span><i className='fas fa-angle-down' style={{ "color": "#D1D1D1" }}></i></span>}
            </div>
            {showDropdownValue && <div className="MA_DropdownOption_container">
                <ul className="MA_DropdownOptionsList">
                    {getMenuItems.map(({ ID, Name }) => (
                        <li className="MA_DropdownOption"
                            onClick={handleSelectItem}
                            value={ID}>{Name}
                        </li>
                    )
                    )}
                </ul>
            </div>
            }
        </div>
    );
}