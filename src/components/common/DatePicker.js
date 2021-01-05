import React, { useState, useEffect } from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import Button from './Button';
import './DatePicker.css';

export default (props) => {
    const [selectedDays, setselectedDays] = useState(props.selectedDates);
    const [from, setFrom] = useState(props.from);
    const [to, setTo] = useState(props.to);
    const [calenderType, setCalenderType] = useState(props.defaultOption);

    useEffect(() => {
        const { selectedDates, from, to } = props;

        setselectedDays(() => {
            return selectedDates && selectedDates.length > 0 ? selectedDates.map(s => new Date(s)) : []
        });

        setFrom(from ? new Date(from) : undefined);
        setTo(to ? new Date(to) : undefined);

    }, [props.from, props.to, props.selectedDates]);

    const handleDayClick = (day, { selected, disabled }) => {
        if (!disabled) {
            if (selected) {
                const selectedIndex = selectedDays.findIndex(selectedDay =>
                    DateUtils.isSameDay(selectedDay, day)
                );
                // selectedDays.splice(selectedIndex, 1);
                setselectedDays(selectedDays.filter((item, index) => selectedIndex !== index))
            } else {
                setselectedDays([...selectedDays, day]);
            }
        }
    }

    const handleDayClickRange = (day, { disabled }) => {
        if (!disabled) {
            const range = DateUtils.addDayToRange(day, { from, to });
            setFrom(range.from);
            setTo(range.to);
        }
    }

    const handleOptionChange = (e) => {
        if (e.target.value == 'option2') {
            setCalenderType("Range");
        } else {
            setCalenderType("Multi");
        }
    }

    const handleOkClick = (e) => {
        let value = {
            range: {},
            selectedDays: [],
        };

        if (selectedDays) {
            value.selectedDays = selectedDays;
        }

        if (from && to) {
            value.range = { from, to };
        }

        // if (calenderType == "Range") {
        //     value.range = { from, to };
        // } else {
        //     value.selectedDays = selectedDays;
        // }
        props.callBack(value);
    }

    const modifiers = { start: from, end: to };
    return (
        <div className="custome-date-picker-container" ref={props.reference}>
            {props.isMultiSupported && <div className="radio-toolbar">
                <span className="radio-span">
                    <label className="radio-inline"><input type="radio" value="option1" name="option" defaultChecked onChange={handleOptionChange} />Multi Select</label>
                </span>
                <span className="radio-span">
                    <label className="radio-inline"><input type="radio" value="option2" name="option" onChange={handleOptionChange} />Range Select</label>
                </span>
            </div>}

            {calenderType === "Range" &&
                <DayPicker
                    numberOfMonths={2}
                    selectedDays={[from, { from, to }]}
                    modifiers={modifiers}
                    onDayClick={handleDayClickRange}
                    disabledDays={props.disabledDays}
                    month={props.month}
                />
            }
            {calenderType !== "Range" &&
                <DayPicker
                    className={""}
                    numberOfMonths={2}
                    selectedDays={selectedDays}
                    modifiers={{}}
                    onDayClick={handleDayClick}
                    disabledDays={props.disabledDays}
                    month={props.month}
                />
            }

            <div className="date-picker-ok-button">
                <Button variant="primary" className={"date-picker-button"}
                    onClick={handleOkClick} caption="Ok" />
            </div>

            <div className="date-picker-ok-button">
                <Button variant="secondary" className={"date-picker-button"}
                    onClick={props.closeDialog} caption="Cancel" />
            </div>
        </div>
    );
}
