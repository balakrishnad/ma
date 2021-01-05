import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import { Overlay, Popover } from 'react-bootstrap';
import CustomLabel from './CustomLabel';
import InventoriesStatus from './InventoriesStatus';
import assetInfoIcon from '../../styles/images/app_logo.png';
import ActionButtons from './ActionButtons';
import { TextField, Button, CalendarIcon, ExpandIcon, CollapseIcon, AlertTickIcon, RemoveIcon, DownloadIcon, AssetEditIcon, AssetLinkIcon, ThumbnailIcon } from '../../components/common';
import useOnClickOutside from '../../components/common/OutsideHandler';
import { serviceUrlHost } from '../../utils/apiUrls';
import './InventoriesCard.css';
import {
    getFrequencyString, getDateString, getColororBnwString
} from '../../utils/cardUtils';
import DatePicker from '../../components/common/DatePicker.js';

export default ({
    actionEnabled = false,
    campaignHeaderEnabled = true,
    inventoryCardEnabled = true,
    onlyCampaign = false,
    showAssetInfo = true,
    holdInventory = false,
    showBrandRight = false,
    holdInventoryObject = {},
    data, shadow, assetProps,
    leftActionimg, rightActionImg, deleteActionImg,
    campaignHeaderStyle
}) => {

    const [showMore, setShowMore] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [dataToDisplay, setDataToDisplay] = useState({});
    const [disableHoldBtn, setDisableHoldBtn] = useState(false);
    const cardShadow = '0px 1px 8px #999999'
    const actionButtonProps = {
        leftActionimg,
        rightActionImg,
        deleteActionImg,
        data,
        dataToDisplay,
        onlyCampaign
    };

    useEffect(() => {
        let dataToDisplay = {
            ...data,
        };
        if (onlyCampaign && Object.keys(data).length > 0) {
            const startDate = new Date(data.CampaignStartDate);
            const endDate = new Date(data.CampaignEndDate);

            const fromday = startDate.getDate();
            const frommonth = startDate.getMonth() + 1;
            const fromyear = startDate.getFullYear();

            const today = endDate.getDate();
            const tomonth = endDate.getMonth() + 1;
            const toyear = endDate.getFullYear();

            dataToDisplay.campaignID = data.CampaignID;
            dataToDisplay.campaignName = data.CampaignName;
            dataToDisplay.campaignStartDate = frommonth + '/' + fromday + '/' + fromyear;
            dataToDisplay.campaignEndDate = tomonth + '/' + today + '/' + toyear;
            dataToDisplay.campaignBrand = data.Brand.map((item) => { return item['Name'] }).join(',');
            dataToDisplay.campaignBrandIDs = data.Brand.map((item) => { return item['ID'] }).join(',');
            dataToDisplay.campaignNotes = data.CampaignNotes;
            dataToDisplay.campaignContact = data.CampaignContact;
            dataToDisplay.contactEmailID = data.ContactEmailID;
        } else if (!onlyCampaign) {
            if (inventoryCardEnabled) {
                dataToDisplay = {
                    ...dataToDisplay,
                    inventoryAvailability: data.InventoryAvailabilityStartDate + ' to ' + data.InventoryAvailabilityEndDate,
                    frequency: getFrequencyString(data.Frequency),
                    colorOrBNW: getColororBnwString(data.ColorType),
                    inventoryBlackoutDates: getDateString(data.InventoryBlackedOutDates),
                    inventoryHoldDates: getDateString(data.InventoryHoldDates),
                    inventoryLockedDates: getDateString(data.InventoryLockedDates),
                    uploadSpecSheet: data.SpecSheetFileName || data.SpecSheetURL,
                    uploadSpecSheetLink: data.SpecSheetURL,
                }
            }

            const campaignDetails = data.CampaignDetails;
            const assetDetails = data.AssetDetails;

            if (campaignDetails.CampaignID !== null) {
                const startDate = new Date(campaignDetails.CampaignStartDate);
                const endDate = new Date(campaignDetails.CampaignEndDate);

                const fromday = startDate.getDate();
                const frommonth = startDate.getMonth() + 1;
                const fromyear = startDate.getFullYear();

                const today = endDate.getDate();
                const tomonth = endDate.getMonth() + 1;
                const toyear = endDate.getFullYear();

                dataToDisplay.campaignID = campaignDetails.CampaignID;
                dataToDisplay.campaignName = campaignDetails.CampaignName;
                dataToDisplay.campaignStartDate = frommonth + '/' + fromday + '/' + fromyear;
                dataToDisplay.campaignEndDate = tomonth + '/' + today + '/' + toyear;
                dataToDisplay.campaignNotes = campaignDetails.CampaignNotes;
                dataToDisplay.campaignContact = campaignDetails.CampaignContact;
                dataToDisplay.campaignBrand = campaignDetails.Brand;
            }

            if (assetDetails.AssetID !== null) {
                dataToDisplay.downloadLink = assetDetails.SPAssetUrl;
                dataToDisplay.assetType = assetDetails.AssetType;
                dataToDisplay.duration = assetDetails.Duration;
                dataToDisplay.assetId = assetDetails.AssetID;
                dataToDisplay.thumbNail = assetDetails.ThumbNail;
                dataToDisplay.modificationNotes = assetDetails.ModificationNotes;
                dataToDisplay.brandRightsVerification = assetDetails.BrandRightsVerification;
            }
        }


        setDataToDisplay({ ...dataToDisplay });
    }, [data]);

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
    const blackedOutDatesArr = getDisableDateObjectArray(dataToDisplay.InventoryBlackedOutDates);
    const holdDatesArr = getDisableDateObjectArray(dataToDisplay.InventoryHoldDates);
    const lockedDatesArr = getDisableDateObjectArray(dataToDisplay.InventoryLockedDates);
    const availableDatesArr = getInvenAvailableDisableDateObjectArray(dataToDisplay.InventoryAvailabilityStartDate + ':' + dataToDisplay.InventoryAvailabilityEndDate);
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
        // console.log('Disabled Dates:-', dateSet);
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
            url: serviceUrlHost + '/api/Asset/DownloadCount/' + dataToDisplay.assetId,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            }
        }).then((response) => {
            // console.log(response);
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
        <Card className="card-layout" style={{ boxShadow: (shadow) ? cardShadow : 'none' }}>

            {actionEnabled && <div className="action-container d-none d-md-block d-sm-none">
                <ActionButtons {...actionButtonProps} />
            </div>}
            <Container fluid={true} className="card-top-level-container">
                {campaignHeaderEnabled && <Container className="campaign-container" fluid={true} style={campaignHeaderStyle}>
                    <Row className="campaign-container-row MobileRowWrapper">
                        <Col md={2} xs={12}><CustomLabel name="Campaign Name" value={dataToDisplay.campaignName} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Campaign Start Date" value={dataToDisplay.campaignStartDate} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Campaign End Date" value={dataToDisplay.campaignEndDate} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Brand(s)" value={dataToDisplay.campaignBrand} /></Col>
                        
                    </Row>
                    <Row className="campaign-container-row">
                        <Col md={2} xs={6} className='custom-col-20-percent-width'><CustomLabel name="Campaign Contact" value={dataToDisplay.campaignContact} /></Col>
                        <Col md={2} xs={6} className='custom-col-80-percent-width M-bottom-1rem'><CustomLabel name="Campaign Notes" value={dataToDisplay.campaignNotes} maxwidth='100%' /></Col>
                        <Col xs={12} className="d-block d-md-none ActionAR">
                            {actionEnabled && <div className="action-container">
                                <ActionButtons {...actionButtonProps} />
                            </div>}
                        </Col>
                    </Row>
                </Container>}
                {inventoryCardEnabled && <div className="VisiablePart asset-download-styling"><Row className="customer-container">
                    <Col md={2} xs={6}><CustomLabel name="Customer Name" value={validateData(dataToDisplay.CustomerName)} /></Col>
                    <Col md={2} xs={6}><CustomLabel name="Venue Type" value={validateData(dataToDisplay.VenueType)} /></Col>
                    <Col md={2} xs={6}><CustomLabel name="Media Channel" value={validateData(dataToDisplay.MediaChannel)} /></Col>
                    <Col md={2} xs={6}><CustomLabel name="Spec Sheet" value={validateData(dataToDisplay.uploadSpecSheet)}
                        isLink={true} isServiceLink={!!dataToDisplay.SpecSheetFileName}
                        linkUrl={!dataToDisplay.uploadSpecSheetLink ? '' : dataToDisplay.uploadSpecSheetLink} /></Col>
                    <Col></Col>
                </Row>
                    <Row className="customer-container paddTop0">
                        <Col md={2} xs={6}><CustomLabel name="Status" value={<InventoriesStatus status={validateData(dataToDisplay.InventoryStatus)} />} ></CustomLabel></Col>
                        <Col md={2} xs={6}><CustomLabel name="Inventory Availability" value={validateData(dataToDisplay.inventoryAvailability)} tooltipEnabled={true}/></Col>
                        <Col md={2} xs={6}><CustomLabel name="Location" value={getLoactionDetails(validateData(dataToDisplay.LocationDetails))} tooltipEnabled={true} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="Estimated Value" value={validateData(dataToDisplay.InventoryEstimatedValue, true)} /></Col>
                        <Col md={2} xs={6}><CustomLabel name="CPM" value={validateData(dataToDisplay.CPM, true)} /></Col>
                    </Row>
                    <Row className="customer-container expandBTN">
                        <Col md={2} className="d-none d-md-block d-sm-none">
                            <CustomLabel name="Region" value={validateData(dataToDisplay.Region)} />
                        </Col>
                        <Col md={2} className="d-none d-md-block d-sm-none">
                            <CustomLabel name="Location Details" value={validateData(dataToDisplay.LocationDetailsText)} tooltipEnabled={true} tooltipInline={true} />
                        </Col>
                        {dataToDisplay.inventoryHoldDates && dataToDisplay.inventoryHoldDates !== '' &&
                            <Col md={2} xs={6} className="d-none d-md-block d-sm-none"><CustomLabel name="Inventory Hold Date(s)" value={validateData(dataToDisplay.inventoryHoldDates)} tooltipEnabled={true} /></Col>
                        }
                        {dataToDisplay.inventoryLockedDates && dataToDisplay.inventoryLockedDates !== '' ?
                            <Col md={2} xs={6} className="d-none d-md-block d-sm-none"><CustomLabel name="Inventory Locked Date(s)" value={validateData(dataToDisplay.inventoryLockedDates)} tooltipEnabled={true} /></Col>
                            : <Col></Col>}
                        {!dataToDisplay.inventoryHoldDates && <Col></Col>} {/* to fix the alignment issue when hold dates is not present*/}
                        <Col></Col>
                        <div className="expand-collapse-icon" onClick={handleExpandCollapse}>
                            {showMore ? <CollapseIcon className='expandCollapseIcon' /> : <ExpandIcon className='expandCollapseIcon' />}
                        </div>
                    </Row>
                </div>}
                {showMore &&
                    <div className="more-info-container" >
                        <div className="horizontal_dotted_line"></div>
                        <Row className="customer-container">
                            <Col md={2} xs={6}><CustomLabel name="CMM Contact" value={validateData(dataToDisplay.CMMContact)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Time Flexibility" value={validateData(dataToDisplay.TimeFlexibility)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Timing Flexibility Notes" value={validateData(dataToDisplay.TimingFlexibilityNotes)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Frequency" value={validateData(dataToDisplay.frequency)} tooltipEnabled={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Frequency Notes" value={validateData(dataToDisplay.FrequencyNotes)} tooltipEnabled={true} tooltipInline={true} /></Col>
                        </Row>
                        <Row className="customer-container paddTop0">
                            <Col md={2} xs={6}><CustomLabel name="Annual Traffic" value={validateData(dataToDisplay.AnnualTraffic)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Committed for Next Year" value={validateData(dataToDisplay.CommittedForNextYear)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Committed for Next Year Notes" value={validateData(dataToDisplay.CommittedForNextYearNotes)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}></Col>
                            <Col md={2} xs={6}></Col>
                        </Row>
                        <div className="horizontal_dotted_line"></div>
                        <Row className="customer-container">
                            <Col md={2} xs={6}><CustomLabel name="Quantity per outlet" value={validateData(dataToDisplay.QuantityPerOutlet)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Color or B/W" value={validateData(dataToDisplay.colorOrBNW)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="File Format" value={validateData(dataToDisplay.FileFormat)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="File Format Details" value={validateData(dataToDisplay.FileFormatDetails)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Spec Dimensions" value={validateData(dataToDisplay.SpecDimensions)} /></Col>
                        </Row>
                        <Row className="customer-container paddTop0">
                            <Col md={2} xs={6}> <CustomLabel name="Sound" value={validateData(dataToDisplay.Sound)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Video Orientation" value={validateData(dataToDisplay.VideoOrientation)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Asset Description" value={validateData(dataToDisplay.AssetDescription)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}></Col>
                            <Col md={2} xs={6}></Col>
                        </Row>
                        <div className="horizontal_dotted_line"></div>
                        <Row className="customer-container">
                            <Col md={2} xs={6}><CustomLabel name="Preferred Brand(s)" value={getPreferredBrands(dataToDisplay.PreferredBrands)} tooltipEnabled={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Brand Restrictions" value={validateData(dataToDisplay.BrandRestrictions)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Key Deadline(s) for Creative" value={validateData(dataToDisplay.Deadlines)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Inventory Blackout Date(s)" value={validateData(dataToDisplay.inventoryBlackoutDates)} tooltipEnabled={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Estimated Production Costs" value={validateData(dataToDisplay.EstimatedCostToProduceAndDeliver, true)} /></Col>
                        </Row>
                        <Row className="customer-container paddTop0">
                            <Col md={2} xs={6}><CustomLabel name="Contract Expiration Date" value={validateData(dataToDisplay.ContractExpirationDate)} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Inventory Traffic Process" value={validateData(dataToDisplay.InventoryTrafficProcess)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Additional Comments" value={validateData(dataToDisplay.AdditionalComments)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}></Col>
                            <Col md={2} xs={6}></Col>
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
                            <div className="inventory-card-btnGroup">
                                <Button
                                    variant="secondary"
                                    className="holdBtn"
                                    caption="Hold Inventory"
                                    disabled={!verifyHoldButton() || disableHoldBtn}
                                    onClick={() => {
                                        let data = {
                                            id: dataToDisplay.MediaInventoryId,
                                            from: new Date(from),
                                            to: new Date(to),
                                            disbaledDaysinRange: getDisableDaysinRange(new Date(from), new Date(to))
                                        }
                                        holdInventoryObject.callBack(data);
                                        setDisableHoldBtn(true);
                                    }} />
                            </div>
                        </div>
                    </div>}
                {showAssetInfo && <div className='asset-information'>
                    <div className="horizontal_dotted_line"></div>
                    <div className='asset-data-container'>
                        <Row className="asset-info-styling">
                            <div className="asset-info-media-text">ASSET INFORMATION</div>
                        </Row>
                        <Row className="asset-info-styling">
                            <Col xs={6} md={2}>
                                <div className="asset-info-media-container">

                                    <div className="asset-info-media-content">
                                        <img className="icon-size" src={dataToDisplay.thumbNail ? "data:image/png;base64," + dataToDisplay.thumbNail : assetInfoIcon}></img>
                                    </div>
                                    <div className="d-none d-md-block d-sm-none fragment-styling">
                                        {assetProps && dataToDisplay.downloadLink && <Fragment>
                                            {assetProps.assetLeftActionImage && <a className="asset-action-icon asset-left-action-icon" style={assetProps.assetLeftActionImage.style}
                                                onClick={() => {
                                                    updateDownloadCount(assetProps.assetLeftActionImage.actionHandler, data);
                                                }}
                                                href={dataToDisplay.downloadLink} target="_blank" download>
                                                <DownloadIcon />
                                            </a>}
                                            {assetProps.assetMiddleActionImage && <span className="asset-action-icon asset-middle-action-icon" style={assetProps.assetMiddleActionImage.style}
                                                onClick={() => { assetProps.assetMiddleActionImage.actionHandler(data) }}>
                                                <AssetEditIcon />
                                            </span>}

                                            {assetProps.assetRightActionImage && <span className="asset-action-icon asset-right-action-icon" style={assetProps.assetRightActionImage.style}
                                                onClick={() => { assetProps.assetRightActionImage.actionHandler(dataToDisplay); showToolTipMessage() }}>
                                                <AssetLinkIcon />
                                            </span>}
                                            {assetProps.assetThumbnailActionImage && <span className="asset-action-icon asset-right-action-icon-2" style={assetProps.assetRightActionImage.style}
                                                onClick={() => { assetProps.assetThumbnailActionImage.actionHandler(data); }}>
                                                <ThumbnailIcon />
                                            </span>}
                                        </Fragment>}
                                    </div>
                                    {showTooltip ? <span className='toolTip-Message tooltip-styling'>Link Copied</span> : null}
                                </div>
                            </Col>
                            <Col md={2} xs={6}><CustomLabel name="Asset Description" value={validateData(dataToDisplay.AssetDescription)} tooltipEnabled={true} tooltipInline={true} /></Col>
                            <Col md={2} xs={6}><CustomLabel name="Spec Dimensions" value={validateData(dataToDisplay.SpecDimensions)} /></Col>
                        </Row>
                    </div>
                    <div className='asset-info-view-more' onClick={() => {
                        assetProps.viewMoreAssetInfo(dataToDisplay);
                    }}>View More</div>
                </div>
                }
            </Container>
            {showBrandRight &&
                <div className="brand-right">
                    <span>
                        <AlertTickIcon className="brand-right-icon" />
                    </span>
                    <span className="brand-styling">Brand Rights Verification Completed</span>
                </div>
            }
        </Card>
    </div>);
}
