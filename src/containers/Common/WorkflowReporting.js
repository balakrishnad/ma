import React, { useState, useRef, useEffect } from 'react';
import Axios from 'axios';
import './WorkflowReporting.css'
import { Card, Row, Col, Spinner, Overlay, Popover } from 'react-bootstrap';
import DatePicker from '../../components/common/DatePicker.js';
import { TextField, Button, PrimaryDropdown, AlertBox, CalendarIcon, RemoveIcon } from '../../components/common';
import WorkflowReportingResult from '../../components/common/WorkflowReportingResult'
import { serviceUrlHost } from '../../utils/apiUrls';
import useOnClickOutside from '../../components/common/OutsideHandler';

export default ({ Role }) => {

    const defaultWorkflowCriteria = {
        CampaignID: null,
        StartDate: null,
        EndDate: null,
        CustomerName: null
    }

    const [campaignDate, setCampaignDate] = useState('');
    const [campaignNameList, setCampaignNameList] = useState([]);
    const [workflowCriteria, setWorkflowCriteria] = useState(defaultWorkflowCriteria)
    const [cardsData, setCardsData] = useState([]);
    const [infoMessage, setInfoMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flag, setFlag] = useState(false);

    const [inventoryAvailabilityValue, setInventoryAvailabilityValue] = useState(defaultAvailabilityValue);
    const [showInventoryAvailability, setShowInventoryAvailability] = useState(false);
    const [inventoryAvailabilitytarget, setInventoryAvailabilityTarget] = useState(null);
    const inventoryAvailabilityRef = useRef();
    const [fromInveAvail, setFromInveAvail] = useState(undefined);
    const [toInveAvail, setToInveAvail] = useState(undefined);
    const [fromToTextInveAvail, setFromToTextInveAvail] = useState(undefined);
    const inventoryAvailabilityOverLay = useRef();
    let defaultAvailabilityValue = '';

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
    
    const handleChange = (event, type) => {
        let value = event.target.value;

        if (type === 'CampaignID') {

            setFlag(true);            
            setWorkflowCriteria(workflowCriteria.CustomerName = '');

            if (value === "") {
                clearInvenAvail();
                setFlag(false); 
                setCampaignDate('');
                setWorkflowCriteria(defaultWorkflowCriteria);
                return false;
            }
            const startDate = new Date(event.target.currentObject.campaignStartDate);
            const endDate = new Date(event.target.currentObject.campaignEndDate);
            const fromday = startDate.getDate();
            const frommonth = startDate.getMonth() + 1;
            const fromyear = startDate.getFullYear();
            const today = endDate.getDate();
            const tomonth = endDate.getMonth() + 1;
            const toyear = endDate.getFullYear();
            const rangeVal = (frommonth) + '/' + fromday + '/' + fromyear + ' - '
                + (tomonth) + '/' + today + '/' + toyear;

            setCampaignDate(rangeVal);

            setWorkflowCriteria({
                ...workflowCriteria,
                CampaignID: value || null,
                StartDate: (frommonth) + '/' + fromday + '/' + fromyear,
                EndDate: (tomonth) + '/' + today + '/' + toyear
            });

        }
        else if (type === 'CustomerName') {
            setWorkflowCriteria({
                ...workflowCriteria,
                [type]: value || null,
            });
        }

    };

    const handleSearchClick = () => {
        getWorkflowReporting(workflowCriteria);
    };

    const handleResetClick = () => { 
        clearInvenAvail();
        setFlag(false);
        setCampaignDate('');
        setWorkflowCriteria(defaultWorkflowCriteria);
        getWorkflowReporting(defaultWorkflowCriteria);
    };

    const getDateFormat = (fullDate) => {
        const date = new Date(fullDate);
        const formatDate = date.getDate();
        const formatMonth = date.getMonth() + 1;
        const formatYear = date.getFullYear();
        return formatYear + '-' + formatMonth + '-' + formatDate;
    };
    
    useEffect(() => {
        if (fromToTextInveAvail) {
            setInventoryAvailabilityValue(fromToTextInveAvail);
            const fromDate = getDateFormat(fromInveAvail);
            const toDate = getDateFormat(toInveAvail);
           
            setWorkflowCriteria({
                ... workflowCriteria,
                StartDate: fromDate,
                EndDate: toDate
            });

        } else {
            setWorkflowCriteria({
                ... workflowCriteria,
                StartDate: null,
                EndDate: null
            });
           
        }
    }, [fromToTextInveAvail]);

    useEffect(() => {
        getWorkflowReporting(workflowCriteria);
    }, []);

    useEffect(() => {
        Axios({
            url: serviceUrlHost + '/api/Campaign/CampaignDropdown ',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        }).then(res => {
            if (res && res.data && res.data.CampaignData) {
                const campaignData = res.data.CampaignData;
                const dropdownData = campaignData.map((obj) => ({
                    ID: obj.CampaignID,
                    Name: obj.CampaignName,
                    campaignStartDate: obj.CampaignStartDate,
                    campaignEndDate: obj.CampaignEndDate,
                    brands: obj.Brand,
                    campaignNotes: obj.CampaignNotes,
                    campaignContact: obj.CampaignContact,
                    contactEmailID: obj.ContactEmailID
                }));
                setCampaignNameList(dropdownData);

            }
        }).catch(error => {
            console.log('error fetching campaign dropdown', error);
        });

    }, []);

    const getWorkflowReporting = (inputData) => {
        setLoading(true);
        Axios({
            url: serviceUrlHost + '/api/Inventory/WorkflowReporting',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: inputData
        }).then(res => {
            if (res.data) {
                setCardsData(res.data)
            }

            moveToTop();
            setLoading(false);
        }).catch(error => {
            console.log('fetching data', error);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while fetching data'
            });
            
            moveToTop();
            setLoading(false);
            
            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    const moveToTop = () => {
        window.scroll({
            top: 0,
            left: 0
        });
    };

    return (
        <div className="Workflow-report-wrapper">
            <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} />
            {loading && <div className='workflow-loading-container'>
                <Spinner animation="border" variant="primary" />
            </div>}
            <Card className="shadow-radius">
                <Card.Body>
                    <Card.Title className="d-none d-md-block">Report</Card.Title>
                    <div className="p-2rem">
                        <Card.Text>
                            <Row className="M-bottom-3rem">
                                <Col md={4}>
                                    <PrimaryDropdown
                                        label="Campaign Name"
                                        value={workflowCriteria.CampaignID}
                                        placeholder={'Select Campaign Name'}
                                        onChange={e => handleChange(e, "CampaignID")}
                                        options={campaignNameList}
                                        searchOptionRequired={true}
                                    />
                                </Col>
                                {!flag &&
                                    <Col xs={12} md={4}>
                                        <div>
                                            <TextField type="text" label="Campaign Date" onChange={() => { }}
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
                                }
                                {flag &&
                                    <Col xs={12} md={4}>
                                        <TextField
                                            type="text"
                                            label="Campaign Date"
                                            value={campaignDate || ''}
                                        />
                                    </Col>}
                                <Col md={4} xs={12}>
                                    <TextField
                                        type="text"
                                        label="Customer Name"
                                        onChange={e => handleChange(e, 'CustomerName')}
                                        value={workflowCriteria.CustomerName || ''}
                                        placeholder={'Enter Customer Name'}
                                    />
                                </Col>
                            </Row>
                            <Row className="displayBlock">
                                <div className="btnGroup">
                                    <Button caption="Generate Report" variant="primary" onClick={handleSearchClick} />
                                    <Button caption="Reset" variant="secondary" onClick={handleResetClick} />

                                </div>
                            </Row>
                        </Card.Text>
                    </div>
                </Card.Body>
            </Card>
            {cardsData && cardsData.length > 0 &&
                <WorkflowReportingResult role={Role} data={cardsData} />
            }

            {!loading && cardsData && cardsData.length === 0 &&
                <div className="dotted-results">
                    <div className="dotted_line"></div>
                    <div className="no-results">No data found</div>
                </div>
            }


        </div>
    )
}