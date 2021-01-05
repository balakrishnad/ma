import React, { useState, useRef, useEffect } from 'react';
import { TextField, PrimaryDropdown, MultiDropdown, CalendarIcon, RemoveIcon, Button } from '../../components/common';
import { Card, Row, Col, Overlay, Popover } from 'react-bootstrap';
import DatePicker from '../../components/common/DatePicker.js';
import useOnClickOutside from '../../components/common/OutsideHandler';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BrowseInventorySearch.css';
import * as Constants from '../../utils/constants';

const defaultStatusOptions = [{
    ID: "All",
    Name: "All"
},
{
    ID: "Locked",
    Name: "Locked"
},
{
    ID: "Hold",
    Name: "Hold"
},
{
    ID: "Available",
    Name: "Available"
}
];

const defaultSearchObj = {
    CustomerName: null,
    VenueTypeId: null,
    DivisionIds: null,
    StateIds: null,
    MediaChannelId: null,
    CampaignId: null,
    Status: null,
    StartDate: null,
    EndDate: null,
    AssetDescription: null,
    PreferredFlightTime: null,
    InventoryEstimatedValue: null,
    CPM: null,
    selectedDivision: '',
    selectedState: '',
    selectedStatus: '',
};

export default ({ dropdownOptions, handleSearch, role, windowWidth }) => {
    const { Division, State, VenueType, MediaChannel, Campaign } = dropdownOptions;
    const [searchObj, setSearchObj] = useState(defaultSearchObj);
    const [inventoryAvailabilityValue, setInventoryAvailabilityValue] = useState(defaultAvailabilityValue);
    const [showInventoryAvailability, setShowInventoryAvailability] = useState(false);
    const [inventoryAvailabilitytarget, setInventoryAvailabilityTarget] = useState(null);
    const inventoryAvailabilityRef = useRef();
    const [fromInveAvail, setFromInveAvail] = useState(undefined);
    const [toInveAvail, setToInveAvail] = useState(undefined);
    const [fromToTextInveAvail, setFromToTextInveAvail] = useState(undefined);
    const inventoryAvailabilityOverLay = useRef();
    const [statusOptions, setStatusOptions] = useState(defaultStatusOptions);
    let defaultAvailabilityValue = '';

    const handleChange = (event, type) => {
        let value = event.target.value;
        setSearchObj({
            ...searchObj,
            [type]: value || null,
        });
    };

    const handleMultiChange = (value, type) => {
        switch (type) {
            case 'DivisionId':
                // const DivisionId = value.join(',');
                setSearchObj({
                    ...searchObj,
                    DivisionIds: value,
                    selectedDivision: value,
                });

                break;

            case 'StateIds':
                //const StateIds = value.join(',');

                setSearchObj({
                    ...searchObj,
                    StateIds: value,
                    selectedState: value,
                });
                break;

            case 'Status':
                let Status = value.join(',');
                if (value.includes('All')) {
                    Status = 'All'; // resetting the searchObj value to All. 
                    statusOptions.map((item) => {
                        const isDisabled = item.ID !== 'All' ? true : false;
                        item.disabled = isDisabled;
                        return item;
                    });
                } else {
                    statusOptions.map((item) => {
                        item.disabled = false;
                        return item;
                    });
                }
                setStatusOptions([...statusOptions]);
                setSearchObj({
                    ...searchObj,
                    Status,
                    selectedStatus: value.includes('All') ? ['All'] : value,
                });

                break;

            default:
                break;

        }
    };

    useEffect(() => {
        if (fromToTextInveAvail) {
            setInventoryAvailabilityValue(fromToTextInveAvail);
            const fromDate = getDateFormat(fromInveAvail);
            const toDate = getDateFormat(toInveAvail);
            setSearchObj({
                ...searchObj,
                StartDate: fromDate,
                EndDate: toDate
            });
        } else {
            setSearchObj({
                ...searchObj,
                StartDate: null,
                EndDate: null
            });
        }
    }, [fromToTextInveAvail]);

    const getDateFormat = (fullDate) => {
        const date = new Date(fullDate);
        const formatDate = date.getDate();
        const formatMonth = date.getMonth() + 1;
        const formatYear = date.getFullYear();
        return formatYear + '-' + formatMonth + '-' + formatDate;
    };
    const handleSearchClick = () => {
        handleSearch(searchObj);
    };
    const handleResetClick = () => {
        const resetStatusOptions = statusOptions.map((item) => { // since the inner object is overwritten, default option wont work
            item.disabled = false;
            return item;
        });
        setSearchObj(defaultSearchObj);
        setStatusOptions(resetStatusOptions);
        setFromInveAvail(undefined);
        setToInveAvail(undefined);
        setInventoryAvailabilityValue(defaultAvailabilityValue);
    };
    const handleClickInventoryAvailability = event => {
        setShowInventoryAvailability(!showInventoryAvailability);
        setInventoryAvailabilityTarget(event.target);
    };
    const inventoryAvailabilityCallBack = ({ range }) => {
        if (range.from == null || range.to == null) {
            setFromToTextInveAvail(undefined);
            setFromInveAvail(undefined);
            setToInveAvail(undefined);
        } else {
            let from = new Date(range.from);
            let to = new Date(range.to);
            setFromInveAvail(range.from);
            setToInveAvail(range.to);

            let fromday = from.getDate();
            let frommonth = from.getMonth();
            let fromyear = from.getFullYear();

            let today = to.getDate();
            let tomonth = to.getMonth();
            let toyear = to.getFullYear();

            let rangeVal = (frommonth + 1) + '/' + fromday + '/' + fromyear + ' - ' + (tomonth + 1) + '/' + today + '/' + toyear;

            if (rangeVal !== '') {
                setFromToTextInveAvail(rangeVal);
            } else {
                setFromToTextInveAvail(undefined);
            }
        }
        setShowInventoryAvailability(!showInventoryAvailability);
    };
    useOnClickOutside(inventoryAvailabilityOverLay, () => setShowInventoryAvailability(false));

    const clearInvenAvail = () => {
        setInventoryAvailabilityValue('');
        setFromToTextInveAvail(undefined);
        setFromInveAvail(undefined);
        setToInveAvail(undefined);
    };

    useEffect(() => {
        setSearchObj(defaultSearchObj);
    }, [role]);

    return (
        <div className="BrowseInventoriesSearch BrowseInventoriesSearchMobile">
            <Card className="invetory-browse">
                <Card.Body>
                    <Card.Title className="d-none d-md-block">Browse Inventory</Card.Title>

                    <div className="p-2rem">
                        <Card.Text>
                            <Row className="M-bottom-3rem">
                                <Col className="ipad-spaces" xs={12} sm={3} md={(windowWidth >= 768 && windowWidth <= 1024) ? 6 : 4}>
                                    <TextField
                                        type="text"
                                        label="Customer Name"
                                        onChange={e => handleChange(e, 'CustomerName')}
                                        value={searchObj.CustomerName || ''}
                                        placeholder={'Enter Customer Name'}
                                    />
                                </Col>
                                <Col className="ipad-spaces" xs={12} sm={3} md={(windowWidth >= 768 && windowWidth <= 1024) ? 6 : 4}>
                                    <PrimaryDropdown
                                        label="Venue Type"
                                        value={searchObj.VenueTypeId}
                                        onChange={e => handleChange(e, "VenueTypeId")}
                                        options={VenueType}
                                        placeholder="Select Venue Type"
                                        searchOptionRequired={true}
                                    />
                                </Col>
                                <Col xs={12} sm={4} className="division-display" md={(windowWidth >= 768 && windowWidth <= 1024) ? 12 : 4}>
                                    <Col xs={6} className="location-state">
                                        <MultiDropdown
                                            label="Location"
                                            value={searchObj.selectedDivision}
                                            onChange={e => handleMultiChange(e, 'DivisionId')}
                                            options={Division}
                                            placeholder="Division"
                                            searchOptionRequired={true}

                                        />
                                    </Col>
                                    <Col xs={6} className="state-location">
                                        <MultiDropdown
                                            label={'\u00A0'}
                                            value={searchObj.selectedState}
                                            onChange={e => handleMultiChange(e, 'StateIds')}
                                            options={State}
                                            placeholder="State"
                                            searchOptionRequired={true}
                                        />
                                    </Col>
                                </Col>
                            </Row>
                            <Row className="M-bottom-3rem">
                                <Col md={4} xs={12}>
                                    <PrimaryDropdown
                                        label="Media Channel"
                                        value={searchObj.MediaChannelId}
                                        onChange={e => handleChange(e, "MediaChannelId")}
                                        options={MediaChannel}
                                        placeholder="Select Media Channel"
                                        searchOptionRequired={true}
                                    />
                                </Col>
                                <Col md={4} xs={12}>
                                    <PrimaryDropdown
                                        label="Campaign"
                                        value={searchObj.CampaignId}
                                        onChange={e => handleChange(e, "CampaignId")}
                                        options={Campaign}
                                        placeholder="Select Campaign"
                                        searchOptionRequired={true}
                                    />
                                </Col>
                                <Col md={4} xs={12}>
                                    <MultiDropdown
                                        label='Status'
                                        value={searchObj.selectedStatus}
                                        onChange={e => handleMultiChange(e, 'Status')}
                                        options={statusOptions}
                                        placeholder="Select Status"
                                        searchOptionRequired={true}
                                    />
                                </Col>
                            </Row>
                            <Row className="M-bottom-2rem">
                                <Col xs={12} md={4}>
                                    <div>
                                        <TextField type="text" label="Inventory Availability" onChange={() => { }}
                                            value={inventoryAvailabilityValue || ''} title={inventoryAvailabilityValue || ''} placeholder={'Start Date - End Date'} className="truncate" />
                                        <div className="calendar-icon-container">
                                            {inventoryAvailabilityValue && <span className="calendar-clear-icon" onClick={clearInvenAvail}>
                                                <RemoveIcon />
                                            </span>}
                                            <div className="calendar-icon" onClick={handleClickInventoryAvailability}>
                                                <CalendarIcon />
                                            </div>
                                        </div>
                                        <div>
                                            <Overlay
                                                show={showInventoryAvailability}
                                                target={inventoryAvailabilitytarget}
                                                placement="bottom"
                                                container={inventoryAvailabilityRef.current}
                                                containerPadding={20}
                                                onHide={() => { }}
                                            >
                                                <Popover id="popover-contained">
                                                    <Popover.Content>
                                                        <DatePicker reference={inventoryAvailabilityOverLay} isMultiSupported={false} defaultOption="Range"
                                                            callBack={inventoryAvailabilityCallBack} from={fromInveAvail} to={toInveAvail}
                                                            closeDialog={() => setShowInventoryAvailability(!showInventoryAvailability)}
                                                        />
                                                    </Popover.Content>
                                                </Popover>
                                            </Overlay>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} md={4}>
                                    <TextField
                                        type="text"
                                        label="Asset Description"
                                        onChange={e => handleChange(e, 'AssetDescription')}
                                        value={searchObj.AssetDescription || ''}
                                        placeholder={'Enter Asset Description'}
                                    />
                                </Col>
                                {role == Constants.MM &&
                                    <Col xs={12} md={4}>
                                        <TextField
                                            type="text"
                                            label="Estimated Value"
                                            isNumber
                                            isCurrency
                                            onChange={e => handleChange(e, 'InventoryEstimatedValue')}
                                            value={searchObj.InventoryEstimatedValue || ''}
                                            placeholder={'Enter Estimated Value'}
                                        />
                                    </Col>
                                }
                            </Row>
                            {role == Constants.MM &&
                                <Row>
                                    <Col xs={12} md={4}>
                                        <TextField
                                            type="text"
                                            label="CPM"
                                            isNumber
                                            isCurrency
                                            onChange={e => handleChange(e, 'CPM')}
                                            value={searchObj.CPM || ''}
                                            placeholder={'Enter CPM'}
                                        />
                                    </Col>
                                    <Col xs={4}></Col>
                                    <Col xs={4}></Col>
                                </Row>
                            }
                            <Row className="displayBlock">
                                <div className="btnGroup">
                                    <Button caption="Reset" variant="secondary" onClick={handleResetClick} />
                                    <Button caption="Search" variant="primary" onClick={handleSearchClick} />
                                </div>
                            </Row>
                        </Card.Text>
                    </div>
                </Card.Body>
            </Card>

        </div>
    )
}
