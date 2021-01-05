import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import './InventoriesCard.css';

import CustomLabel from './CustomLabel';
import InventoriesStatus from './InventoriesStatus';
import assetInfoIcon from '../../styles/images/app_logo.png';
import ActionButtons from './ActionButtons';
import { TextField, Button, CalendarIcon, ExpandIcon, CollapseIcon, AlertTickIcon, RemoveIcon, DownloadIcon, AssetEditIcon, AssetLinkIcon, ThumbnailIcon } from '../../components/common';
import { Overlay, Popover } from 'react-bootstrap';
import DatePicker from '../../components/common/DatePicker.js';
import useOnClickOutside from '../../components/common/OutsideHandler';
import { serviceUrlHost } from '../../utils/apiUrls';
import Axios from 'axios';

export default (props) => {

    const { actionEnabled = false } = props;
    const { campaignHeaderEnabled = true } = props;
    const { inventoryCardEnabled = true } = props;
    const { showAssetInfo = true } = props;
    const { holdInventory = false } = props;
    const { showBrandRight = false } = props;
    const { holdInventoryObject = {} } = props;
    const [showMore, setShowMore] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const cardShadow = '0px 1px 8px #999999'

    const actionButtonProps = {
        leftActionimg: props.leftActionimg,
        rightActionImg: props.rightActionImg,
        deleteActionImg: props.deleteActionImg,
        data: props.data
    }

    const showToolTipMessage = () => {
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 1500);
    }

    const getDisableDateObjectArray = (dates) => {
        if (!dates) {
            return [{}];
        } else {
            const dateArray = dates.split(';');
            const rtnArr = dateArray.map((item, i) => {
                const temp = item.split(':');
                if (temp.every((val, i, arr) => val === arr[0])) {
                    return getDateObj(temp[0]);
                } else {
                    let beforeDate = getDateObj(temp[1]);
                    beforeDate.setDate(beforeDate.getDate() + 1);
                    let afterDate = getDateObj(temp[0]);
                    afterDate.setDate(afterDate.getDate() - 1);
                    return {
                        before: beforeDate,
                        after: afterDate
                    };
                }
            })
            return rtnArr;
        }
    }

    const getInvenAvailableDisableDateObjectArray = (dates) => {
        if (!dates) {
            return [{}];
        } else {
            const dateArray = dates.split(':');
            let beforeDate = getDateObj(dateArray[0]);
            beforeDate.setDate(beforeDate.getDate());
            let afterDate = getDateObj(dateArray[1]);
            afterDate.setDate(afterDate.getDate());
            return [{
                before: beforeDate,
                after: afterDate
            }];
        }
    }

    const getDateObj = (dateStr) => {
        return new Date(dateStr);
    }

    const [showHoldInventoryDate, setShowHoldInventoryDate] = useState(false);
    const [fromToTextInveAvail, setFromToTextInveAvail] = useState(undefined);
    const [target, setTarget] = useState(null);
    let defaultHoldInventoryDate = '';
    if (holdInventoryObject.value) {
        defaultHoldInventoryDate = holdInventoryObject.value.join(';');
    }
    const [holdInventoryDateValue, setHoldInventoryDateValue] = useState(defaultHoldInventoryDate);
    const [selectedDates, setSelectedDates] = useState([]);
    const campaignDates = [{
        before: getDateObj(holdInventoryObject.startDate),
        after: getDateObj(holdInventoryObject.endDate)

    }];
    const blackedOutDatesArr = getDisableDateObjectArray(props.data.blackedOutDates);
    const holdDatesArr = getDisableDateObjectArray(props.data.holdDates);
    const lockedDatesArr = getDisableDateObjectArray(props.data.lockedDates);
    const availableDatesArr = getInvenAvailableDisableDateObjectArray(props.data.inventoryAvailableDates);
    const [from, setFrom] = useState(undefined);
    const [to, setTo] = useState(undefined);
    const totalDisabledDates = [].concat.apply([], [campaignDates, blackedOutDatesArr, holdDatesArr, lockedDatesArr, availableDatesArr]);
    const holdInventoryMonth = new Date(getDateObj(holdInventoryObject.startDate).getFullYear(), getDateObj(holdInventoryObject.startDate).getMonth());
    const holdInventoryDateOverLay = useRef();
    const ref = useRef(null);

    const handleClickHoldInventoryDate = event => {
        setShowHoldInventoryDate(!showHoldInventoryDate);
        setTarget(event.target);
    };

    const holdInventoryDateCallBack = ({ range }) => {
        if (!range.from && !range.to) {
            setFromToTextInveAvail(undefined);
            setFrom(undefined);
            setTo(undefined);
        } else {
            let from = new Date(range.from);
            let to = new Date(range.to);
            setFrom(range.from);
            setTo(range.to);

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
        setShowHoldInventoryDate(!showHoldInventoryDate);
    }

    const handleExpandCollapse = () => {
        setShowMore(!showMore);
    }

    const validateData = (dataString, isCurrency) => {
        if (!dataString) {
            return '';
        } else {
            if (isCurrency) {
                dataString = '$ ' + dataString;
            }
            return dataString;
        }
    };

    const verifyHoldButton = () => {
        if (!holdInventoryDateValue) {
            return false;
        } else {
            return true;
        }
    }

    const clearHoldInventory = () => {
        setFromToTextInveAvail(undefined);
        setFrom(undefined);
        setTo(undefined);
    };

    //Location format: Central, Alabama;Alaska;Arizona;|North, Alabama;Alaska;Arizona;|South, California;Colorado
    const getLoactionDetails = (location) => {
        if (!location) {
            return '';
        } else {
            const locationArray = location.split('|');
            return locationArray.map((loc, i) => {
                const regionLocation = loc.split(',');
                if (regionLocation && regionLocation.length === 2) {
                    const region = regionLocation[0];
                    const location = regionLocation[1].split(';');
                    return location.map((l, i) => {
                        if (l !== '') {
                            return region + ' - ' + l;
                        }
                    }).join(', ')
                } else {
                    return regionLocation;
                }
            }).join('')
        }
    }

    const getPreferredBrands = (brands) => {
        if (!brands) {
            return '';
        } else {
            return brands.split(';').join(', ');
        }
    }

    const getDisableDaysinRange = (from, to) => {
        const dateSet = new Set();
        let rtnArr = [];
        let runLoop = true;
        const disabledDates = [...blackedOutDatesArr, ...holdDatesArr, ...lockedDatesArr];
        disabledDates.map((obj, i) => {
            if (obj instanceof Date) {
                dateSet.add(obj.getFullYear() + '-' + (parseInt(obj.getMonth()) + 1) + '-' + obj.getDate());
            } else if (Object.keys(obj).length !== 0) {
                let { startDate, endDate } = obj.before < obj.after ?
                    { startDate: obj.before, endDate: obj.after } : { startDate: obj.after, endDate: obj.before };
                let loopEnd = false;
                startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1);
                while (!loopEnd) {
                    if (startDate <= endDate) {
                        dateSet.add(startDate.getFullYear() + '-' + (parseInt(startDate.getMonth()) + 1) + '-' + startDate.getDate());
                        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
                    } else {
                        loopEnd = true;
                    }
                }
            }
        });

        console.log('Disabled Dates:-', dateSet);

        while (runLoop) {
            if (from > to) {
                runLoop = false;
            } else {
                const temp = from.getFullYear() + '-' + (parseInt(from.getMonth()) + 1) + '-' + from.getDate();
                if (dateSet.has(temp)) {
                    rtnArr.push(from);
                }
                from = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
            }
        }

        return rtnArr;
    }

    const updateDownloadCount = (callBack, data) => {
        Axios({
            url: serviceUrlHost + '/api/Asset/DownloadCount/' + data.assetId,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            }
        }).then((response) => {
            console.log(response);
            callBack('Success');
        }).catch((error) => {
            console.log(error);
            callBack('Error');
        })
    }

    useOnClickOutside(holdInventoryDateOverLay, () => setShowHoldInventoryDate(false));

    // useEffect(() => {
    //  if (showMore) {
    //      setExpandCollapseIcon(CollapseIcon);
    //   } else {
    //    setExpandCollapseIcon(ExpandIcon);
    //  }
    //    }, [showMore]);

    useEffect(() => {
        setHoldInventoryDateValue(fromToTextInveAvail || '');
    }, [fromToTextInveAvail]);

    return (<div className="card-container">
        <Card className="card-layout" style={{ boxShadow: (props.shadow) ? cardShadow : 'none' }}>
            {actionEnabled && <div className="action-container d-none d-sm-block">
                <ActionButtons {...actionButtonProps} />
            </div>}
            <Container fluid={true} className="card-top-level-container">
                {campaignHeaderEnabled && <Container className="campaign-container" fluid={true} style={props.campaignHeaderStyle}>
                    <Row className="campaign-container-row">
                        <Col md={2} xs={12}><CustomLabel name="Campaign Name" value={props.data.campaignName} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Campaign Start Date" value={props.data.campaignStartDate} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Campaign End Date" value={props.data.campaignEndDate} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Brand(s)" value={props.data.campaignBrand} /></Col>
                        <Col md={2} xs={6}></Col>
                    </Row>
                    <Row className="campaign-container-row">
                        <Col md={2} xs={6} className='custom-col-20-percent-width'><CustomLabel name="Campaign Contact" value={props.data.campaignContact} /></Col>
                        <Col md={2} xs={6} className='custom-col-80-percent-width'><CustomLabel name="Campaign Notes" value={props.data.campaignNotes} maxwidth='100%' /></Col>
                    </Row>
                </Container>}
                {inventoryCardEnabled && <div><Row className="customer-container">
                    <Col><CustomLabel name="Customer Name" value={validateData(props.data.customerName)} /></Col>
                    <Col><CustomLabel name="Venue Type" value={validateData(props.data.venueType)} /></Col>
                    <Col><CustomLabel name="Media Channel" value={validateData(props.data.mediaChannel)} /></Col>
                    <Col><CustomLabel name="Spec Sheet" value={validateData(props.data.uploadSpecSheet)}
                        isLink={true} isServiceLink={!!props.data.SpecSheetFileName}
                        linkUrl={!props.data.uploadSpecSheetLink ? '' : props.data.uploadSpecSheetLink} /></Col>
                    <Col></Col>
                </Row>
                    <Row className="customer-container">
                        <Col><CustomLabel name="Status" value={<InventoriesStatus status={validateData(props.data.status)} />} ></CustomLabel></Col>
                        <Col><CustomLabel name="Inventory Availability" value={validateData(props.data.inventoryAvailability)} /></Col>
                        <Col><CustomLabel name="Location" value={getLoactionDetails(validateData(props.data.location))} tooltipEnabled={true} /></Col>
                        <Col><CustomLabel name="Estimated Value" value={validateData(props.data.estimatedValue, true)} /></Col>
                        <Col><CustomLabel name="CPM" value={validateData(props.data.cpm, true)} /></Col>
                    </Row>
                    <Row className="customer-container">
                        <Col>
                            <CustomLabel name="Region" value={validateData(props.data.region)} />
                        </Col>
                        <Col>
                            <CustomLabel name="Location Details" value={validateData(props.data.locationDetailsText)} tooltipEnabled={true} tooltipInline={true} />
                        </Col>
                        {props.data.inventoryHoldDates && props.data.inventoryHoldDates !== '' &&
                            <Col><CustomLabel name="Inventory Hold Date(s)" value={validateData(props.data.inventoryHoldDates)} tooltipEnabled={true} /></Col>
                        }
                        {props.data.inventoryLockedDates && props.data.inventoryLockedDates !== '' ?
                            <Col><CustomLabel name="Inventory Locked Date(s)" value={validateData(props.data.inventoryLockedDates)} tooltipEnabled={true} /></Col>
                            : <Col></Col>}
                        {!props.data.inventoryHoldDates && <Col></Col>} {/* to fix the alignment issue when hold dates is not present*/}
                        <Col></Col>
                        <div className="expand-collapse-icon" onClick={handleExpandCollapse}>
                            {/* <img src={expandCollapseIcon} /></div>  */}
                            {showMore ? <CollapseIcon className='expandCollapseIcon' /> : <ExpandIcon className='expandCollapseIcon' />}

                        </div>

                    </Row></div>}
                {showMore &&
                    <div className="more-info-container">
                        <div className="horizontal_dotted_line"></div>
                        <Row className="customer-container">
                            <Col><CustomLabel name="CMM Contact" value={validateData(props.data.cmmContact)} /></Col>
                            <Col><CustomLabel name="Time Flexiblity" value={validateData(props.data.timeFlexiblity)} /></Col>
                            <Col><CustomLabel name="Timing Flexiblity Notes" value={validateData(props.data.timingFlexibilityNotes)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col><CustomLabel name="Frequency" value={validateData(props.data.frequency)} tooltipEnabled={true} /></Col>
                            <Col><CustomLabel name="Frequency Notes" value={validateData(props.data.frequencyNotes)} tooltipEnabled={true} tooltipInline={true} /></Col>
                        </Row>
                        <Row className="customer-container">
                            <Col><CustomLabel name="Annual Traffic" value={validateData(props.data.annualTraffic)} /></Col>
                            <Col><CustomLabel name="Committed for Next Year" value={validateData(props.data.committedForNextYear)} /></Col>
                            <Col><CustomLabel name="Committed for Next Year Notes" value={validateData(props.data.committedForNextYearNotes)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col></Col>
                            <Col></Col>
                        </Row>
                        <div className="horizontal_dotted_line"></div>
                        <Row className="customer-container">
                            <Col><CustomLabel name="Quantity per outlet" value={validateData(props.data.quantityPerOutlet)} /></Col>
                            <Col><CustomLabel name="Color or B/W" value={validateData(props.data.colorOrBNW)} /></Col>
                            <Col><CustomLabel name="File Format" value={validateData(props.data.fileFormat)} /></Col>
                            <Col><CustomLabel name="File Format Details" value={validateData(props.data.fileFormatDetails)} /></Col>
                            <Col><CustomLabel name="Spec Dimensions" value={validateData(props.data.specDimensions)} /></Col>
                        </Row>
                        <Row className="customer-container">
                            <Col><CustomLabel name="Sound" value={validateData(props.data.sound)} /></Col>
                            <Col><CustomLabel name="Video Orientation" value={validateData(props.data.videoOrientation)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col><CustomLabel name="Asset Description" value={validateData(props.data.assetDescription)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col></Col>
                            <Col></Col>
                        </Row>
                        {/* <Row className="customer-container">
                            <Col><CustomLabel name="Asset Description" value={validateData(props.data.assetDescription)} /></Col>
                            <Col></Col>
                            <Col></Col>
                            <Col></Col>
                            <Col></Col>
                        </Row> */}
                        <div className="horizontal_dotted_line"></div>
                        <Row className="customer-container">
                            <Col><CustomLabel name="Preferred Brand(s)" value={getPreferredBrands(props.data.preferredBrand)} tooltipEnabled={true} /></Col>
                            <Col><CustomLabel name="Brand Restrictions" value={validateData(props.data.brandRestrictions)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col><CustomLabel name="Key Deadline(s) for Creative" value={validateData(props.data.keyDeadlineForCreative)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col><CustomLabel name="Inventory Blackout Date(s)" value={validateData(props.data.inventoryBlackoutDates)} tooltipEnabled={true} /></Col>
                            <Col><CustomLabel name="Estimated Production Costs" value={validateData(props.data.estimatedProductionCosts, true)} /></Col>
                        </Row>
                        <Row className="customer-container">
                            <Col><CustomLabel name="Contract Expiration Date" value={validateData(props.data.contractExpirationDate)} /></Col>
                            <Col><CustomLabel name="Inventory Traffic Process" value={validateData(props.data.inventoryTrafficProcess)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col><CustomLabel name="Additional Comments" value={validateData(props.data.additionalComments)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col></Col>
                            <Col></Col>
                        </Row>
                    </div>
                }
                {holdInventory &&
                    <div>
                        <div className="horizontal_dotted_line"></div>
                        <div className='hold-inventory-container'>
                            <div className='hold-inventory'>
                                <TextField
                                    type="text"
                                    label="Select a Date Range"
                                    onChange={() => { }}
                                    value={holdInventoryDateValue}
                                    title={holdInventoryDateValue}
                                    placeholder={'\u00A0'}
                                    className="truncate" />
                                <div className="calendar-icon-container">
                                    {holdInventoryDateValue && <span className="calendar-clear-icon" onClick={clearHoldInventory}>
                                        <RemoveIcon />
                                    </span>}
                                    <div className="calendar-icon" onClick={handleClickHoldInventoryDate}>
                                        <CalendarIcon />
                                    </div>
                                </div>
                                <div>
                                    <Overlay
                                        show={showHoldInventoryDate}
                                        target={target}
                                        placement="bottom"
                                        container={ref.current}
                                        containerPadding={20}
                                        onHide={() => { }}
                                    >
                                        <Popover id="popover-contained">
                                            <Popover.Content>
                                                <DatePicker
                                                    reference={holdInventoryDateOverLay}
                                                    isMultiSupported={false}
                                                    defaultOption="Range"
                                                    callBack={holdInventoryDateCallBack}
                                                    selectedDates={selectedDates}
                                                    from={from}
                                                    to={to}
                                                    disabledDays={totalDisabledDates}
                                                    month={holdInventoryMonth}
                                                    closeDialog={() => setShowHoldInventoryDate(!showHoldInventoryDate)}
                                                />
                                            </Popover.Content>
                                        </Popover>
                                    </Overlay>
                                </div>
                            </div>
                            <div className="btnGroup">
                                <Button
                                    variant="secondary"
                                    className="holdBtn"
                                    caption="Hold Inventory"
                                    disabled={!verifyHoldButton()}
                                    onClick={() => {
                                        let data = {
                                            id: props.data.mediaInventoryId,
                                            from: new Date(from),
                                            to: new Date(to),
                                            disbaledDaysinRange: getDisableDaysinRange(new Date(from), new Date(to))
                                        }
                                        holdInventoryObject.callBack(data);
                                    }} />
                            </div>
                        </div>
                    </div>}
                {showAssetInfo && <div className='asset-information'>
                    <div className="horizontal_dotted_line"></div>
                    <div className='asset-data-container'>
                        <div className="asset-info-media-container">
                            <div className="asset-info-media-text">ASSET INFORMATION</div>
                            <div className="asset-info-media-content">
                                <img style={{ width: '100%', height: 'auto' }} src={props.data.thumbNail ? "data:image/png;base64," + props.data.thumbNail : assetInfoIcon}></img>
                            </div>
                            <div style={{ paddingTop: '1rem', display: 'inline' }}>
                                {props.assetProps && props.data.downloadLink && <Fragment>
                                    {props.assetProps.assetLeftActionImage && <a className="asset-action-icon asset-left-action-icon" style={props.assetProps.assetLeftActionImage.style}
                                        onClick={() => {
                                            updateDownloadCount(props.assetProps.assetLeftActionImage.actionHandler, props.data);
                                        }}
                                        href={props.data.downloadLink} target="_blank" download>
                                        <DownloadIcon />
                                    </a>}
                                    {props.assetProps.assetMiddleActionImage && <span className="asset-action-icon asset-middle-action-icon" style={props.assetProps.assetMiddleActionImage.style}
                                        onClick={() => { props.assetProps.assetMiddleActionImage.actionHandler(props.data) }}>
                                        <AssetEditIcon />
                                    </span>}

                                    {props.assetProps.assetRightActionImage && <span className="asset-action-icon asset-right-action-icon" style={props.assetProps.assetRightActionImage.style}
                                        onClick={() => { props.assetProps.assetRightActionImage.actionHandler(props.data); showToolTipMessage() }}>
                                        <AssetLinkIcon />
                                    </span>}
                                    {props.assetProps.assetRightActionImage && <span className="asset-action-icon asset-right-action-icon-2" style={props.assetProps.assetRightActionImage.style}
                                        onClick={() => { props.assetProps.assetThumbnailActionImage.actionHandler(props.data); }}>
                                        <ThumbnailIcon />
                                    </span>}
                                </Fragment>}
                            </div>
                            {showTooltip ? <span className='toolTip-Message' style={{ marginLeft: '1rem' }}>Link Copied</span> : null}
                        </div>
                        <div className="asset-info-container">
                            <Row className="customer-container">
                                <Col md={3}><CustomLabel name="Asset Description" value={validateData(props.data.assetDescription)} tooltipEnabled={true} tooltipInline={true} /></Col>
                                <Col md={3}><CustomLabel name="Spec Dimensions" value={validateData(props.data.specDimensions)} /></Col>
                                {/* <Col md={3}><CustomLabel name="Asset Type" value={validateData(props.data.assetType)} /></Col> */}
                            </Row>
                            {/* <Row className="customer-container">
                            <Col md={3}><CustomLabel name="File Format (physical/digital/audio/other)" value={validateData(props.data.fileFormat)} /></Col>
                            <Col md={3}><CustomLabel name="Color or Black/ White" value={validateData(props.data.colorOrBNW)} /></Col>
                            <Col md={3}><CustomLabel name="Annual Traffic" value={validateData(props.data.annualTraffic)} /></Col>
                            <Col md={3}><CustomLabel name="Quantity per outlet" value={validateData(props.data.quantityPerOutlet)} /></Col>
                        </Row> */}
                        </div>
                    </div>
                    <div className='asset-info-view-more' onClick={() => {
                        props.assetProps.viewMoreAssetInfo(props.data);
                    }}>View More</div>
                </div>
                }
            </Container>
            {showBrandRight &&
                <div className="brand-right">
                    <span>
                        <AlertTickIcon className="brand-right-icon" />
                    </span>
                    <span style={{ paddingLeft: "0.8rem" }}>Brand Rights Verification Completed</span></div>
            }
        </Card>
    </div>);
}