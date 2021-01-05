import React, { useEffect, useState, Fragment } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import InventoriesCard from '../../components/common/InventoriesCard';
import { TextField, PrimaryDropdown, Button, InventoriesFilter, AlertBox, Pagination } from '../../components/common';
import { getUserEmail } from '../../utils/userRolehelper';
import { Row, Col, Spinner, Modal, Card } from 'react-bootstrap';
import rejectIcon from '../../styles/images/Reject.svg';
import approveIcon from '../../styles/images/tick-white.svg';
import tickBlackIcon from '../../styles/images/tick_black.svg';
import { serviceUrlHost } from '../../utils/apiUrls';
import Axios from 'axios';
import './PendingApprovals.css';

const userEmail = getUserEmail();

const filterByOptions = [
    { ID: 'CustomerName', Name: 'Customer Name' },
    { ID: 'VenueType', Name: 'Venue Type' },
    { ID: 'LocationDetails', Name: 'Location' },
    { ID: 'MediaChannel', Name: 'Media Channel' }
];

const PendingApprovals = () => {

    const inventoriesCardDefaultProps = {
        actionEnabled: true,
        leftActionimg: {
            icon: rejectIcon,
            style: {
                backgroundColor: '#d53d01'
            },
            actionHandler: (data) => {
                if (!loading) {
                    setShow(!show);
                    setApproveOrRejectObject({
                        ...approveOrRejectObject,
                        CampaignID: data.CampaignDetails.CampaignID,
                        MediaInventoryID: data.MediaInventoryId,
                        HoldRangeDates: getHoldDateRangeArray(data.InventoryHoldDates),
                        InventoryStatus: 'Rejected',
                        HoldApprovalNotes: rejectionNotes,
                        ModifiedBy: userEmail,
                        ModifiedDate: new Date()
                    });
                }
            }
        },
        rightActionImg: {
            icon: approveIcon,
            style: {
                backgroundColor: '#28b407'
            },
            actionHandler: (data) => {
                if (!loading) {
                    setApproveOrRejectObject({
                        ...approveOrRejectObject,
                        CampaignID: data.CampaignDetails.CampaignID,
                        MediaInventoryID: data.MediaInventoryId,
                        HoldRangeDates: getHoldDateRangeArray(data.InventoryHoldDates),
                        InventoryStatus: 'Approved',
                        HoldApprovalNotes: '',
                        ModifiedBy: userEmail,
                        ModifiedDate: new Date()
                    });
                    setAction(true);
                }
            }
        },
        showAssetInfo: false,
        campaignHeaderEnabled: true,
        campaignHeaderStyle: {
            backgroundColor: '#BCDCEE',
            borderRadius: '10px 10px 0px 0px'
        },
        holdInventoryObject: {},
        data: {}
    }

    const defaultApproveRejectObj = {
        CampaignID: '',
        MediaInventoryID: '',
        HoldRangeDates: [],
        InventoryStatus: '',
        HoldApprovalNotes: '',
        ModifiedBy: '',
        ModifiedDate: ''
    };

    const [loading, setLoading] = useState(true);
    const [inventoryCardData, setInventoryCardData] = useState(null);
    const [inventoryCardOriginalData, setInventoryCardOriginalData] = useState();
    const [resultDataLength, setResultDataLength] = useState(0);
    const [filterById, setFilterById] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [noData, setNoData] = useState(false);
    const [infoMessage, setInfoMessage] = useState(null);
    const [approveOrRejectObject, setApproveOrRejectObject] = useState(defaultApproveRejectObj);
    const [action, setAction] = useState(false);
    const [show, setShow] = useState(false);
    const [rejectionNotes, setRejectionNotes] = useState('');

    const [cardCount, setcardCount] = useState(50);
    const [fromToCount, setFromToCount] = useState({});
    const [paginatedData, setPaginatedData] = useState({});
    const [isSamePage, setSamePage] = useState(false);
    const [activePage, setActivePage] = useState(1);

    //Format from API: InventoryHoldDates : "11/11/2019:12/02/2019;12/06/2019:12/07/2019"
    const getHoldDateRangeArray = (inventoryHoldDates) => {
        if (!inventoryHoldDates) {
            return [];
        } else {
            const dateRangeArray = inventoryHoldDates.split(';');
            return dateRangeArray.map((range, i) => {
                const splitDates = range.split(':');
                if (splitDates.length === 1) {
                    return {
                        StartDate: splitDates[0],
                        EndDate: splitDates[0],
                    }
                } else if (splitDates.length === 2) {
                    return {
                        StartDate: splitDates[0],
                        EndDate: splitDates[1],
                    }
                } else {
                    return {};
                }
            })
        }
    }

    const handleClose = () => setShow(false);

    const handleRejectAction = () => {
        setApproveOrRejectObject({
            ...approveOrRejectObject,
            HoldApprovalNotes: rejectionNotes,
        });
        setAction(true);
        setShow(false);
    }

    const handleRejectNotesChange = (event) => {
        setRejectionNotes(event.target.value);
    }

    const handleFilterBy = (e) => {
        setFilterById(e.target.value);
        setFilterText('');
        setInventoryCardData(inventoryCardOriginalData);
        setResultDataLength(inventoryCardOriginalData.length);
    }

    const handleFilterTextChange = (e) => {
        if (filterById) {
            const text = (['VenueType', 'MediaChannel'].indexOf(filterById) !== -1) && e.target.currentObject ? e.target.currentObject.Name : e.target.value;
            filterAvailableInventories(filterById, text);// need to have the selected text for filtering
        }
        setFilterText(e.target.value); // need to fetch the selected value for dropdown
    }

    const filterAvailableInventories = (key, value) => {
        let filteredData = inventoryCardOriginalData;
        if (key === 'none') {
            setInventoryCardData(inventoryCardOriginalData);
            setResultDataLength(inventoryCardOriginalData.length);

            return false;
        } else if (value !== '') {
            filteredData = inventoryCardOriginalData.filter((data, i) => {
                if (data[key]) {
                    return (data[key].toLowerCase().indexOf(value.toLowerCase()) !== -1);
                }
                return false;
            });
        }
        setInventoryCardData(filteredData);
        setResultDataLength(filteredData.length);
    }

    const getPendingApprovalInventory = () => {
        setInventoryCardData([]);
        setLoading(true);
        Axios({
            url: serviceUrlHost + '/api/Campaign/SearchInventoryForApprovals',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: { "CMMEmailID": userEmail }
        }).then((response) => {
            if (response.data) {
                const dataObj = response.data;
                setResultDataLength(dataObj.length);
                setInventoryCardData(dataObj);
                setInventoryCardOriginalData(dataObj);
                moveToTop();
                setFilterById('');
                setFilterText('');
            } else {
                setResultDataLength(0);
                moveToTop();
                setFilterById('');
                setFilterText('');
            }
            setLoading(false);
        }).catch((error) => {
            console.log(error);
            setLoading(false);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while fetching Inventory Pending Approvals.'
            });

            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    const getPaginatedData = (pageNum, cardCount) => {
        const startCard = pageNum === 1 ? 0 : (pageNum - 1) * cardCount; // based on number of records to be shown
        const endCard = inventoryCardData.length > (startCard + cardCount) ? (startCard + cardCount) : inventoryCardData.length; // since obj starts from position 0
        const fromTo = { 'from': startCard + 1, 'to': endCard };
        setFromToCount(fromTo); // as card length always starts from 0
        setPaginatedData(inventoryCardData.slice(startCard, endCard));
        setActivePage(pageNum);
    };

    useEffect(() => {
        if (inventoryCardData !== null && inventoryCardData.length >= 0) {
            getPaginatedData(1, cardCount);
            setSamePage(false);
        } // whenever the data is changed, we need to show only the paginated data
    }, [inventoryCardData]);

    const moveToTop = () => {
        window.scroll({
            top: 0,
            left: 0
        });
    }

    const ApproveOrRejectAction = () => {
        setLoading(true);
        setAction(false);
        Axios({
            url: serviceUrlHost + '/api/Campaign/CampaignApproval',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: approveOrRejectObject
        }).then((response) => {
            console.log(response);
            if (approveOrRejectObject.InventoryStatus === 'Approved') {
                setInfoMessage({
                    variant: 'success',
                    message: 'Inventory hold request has been approved.',
                    icon: tickBlackIcon
                });
            }
            setLoading(false);
            moveToTop();
            getPendingApprovalInventory();

            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        }).catch((error) => {
            console.log(error);
            setLoading(false);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while updating Pending Approvals.'
            });

            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    useEffect(() => {
        if (action) {
            ApproveOrRejectAction();
        }
    }, [action]);

    useEffect(() => {
        getPendingApprovalInventory();
    }, []);

    useEffect(() => {
        if (!resultDataLength) {
            setNoData(true);
        } else {
            setNoData(false);
        }
    }, [resultDataLength]);

    return (
        <Fragment>
            <Card.Title className="Title-Mobile sticky-top">Pending Approvals</Card.Title>
            <div className='view-pendingApprovals-container'>
                <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} />

                <div className='pendingApprovals-container'>
                    <div className='pendingApprovals'>
                        {inventoryCardOriginalData && inventoryCardOriginalData.length > 0 ?
                            <Row>
                                <Col>
                                    <div className='pendingApprovals-title'>Inventory Pending Approvals</div>
                                    <div className='pendingApprovals-result'>{resultDataLength} Results</div>
                                </Col>
                                <Col xs={12} sm={3} className='filterBy'>
                                    <PrimaryDropdown
                                        value={filterById}
                                        label=""
                                        placeholder="Filter By"
                                        options={filterByOptions}
                                        searchOptionRequired={true}
                                        onChange={e => handleFilterBy(e)}
                                    />
                                </Col>
                                <Col sm={3} xs={12} className='filterType'>
                                    <InventoriesFilter
                                        filterType={filterById}
                                        onChange={e => handleFilterTextChange(e)}
                                        value={filterText} />
                                </Col>
                            </Row>
                            : <Row>
                                <Col>
                                    <div className='pendingApprovals-title'>Inventory Pending Approvals</div>
                                    <div className='pendingApprovals-result'>{resultDataLength} Results</div>
                                </Col>
                            </Row>
                        }
                        {/* show pagination only if data is present */}
                        {inventoryCardData && inventoryCardData.length > 0 &&
                            <Pagination data={inventoryCardData} itemsCount={inventoryCardData.length} onPageChange={getPaginatedData} cardCount={cardCount}
                                fromToCount={fromToCount} showSamePage={isSamePage} activePageItem={activePage} />
                        }
                        <div className="pendingApprovals-dotted_line"></div>
                        <div className='pendingApprovals-cards-container'>
                            {loading && <div className='pendingApprovals-loading-container'>
                                <Spinner animation="border" variant="primary" />
                            </div>}
                            {paginatedData && paginatedData.length > 0 && paginatedData.map((card, i) => {
                                inventoriesCardDefaultProps.data = card;

                                return <div className='pendingApprovals-card' key={i}>
                                    <InventoriesCard {...inventoriesCardDefaultProps} />
                                </div>
                            })}
                            {!loading && noData &&
                                <div>
                                    <div className='pendingApprovals-inventory-no-data'>No Inventory Found.</div></div>}
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={show} onHide={handleClose} dialogClassName="modal-60w">
                <div className='reject-inventory-header'>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <div className='reject-inventory-title'>Rejection Notes</div>
                        </Modal.Title>
                    </Modal.Header>
                </div>
                <Modal.Body>
                    <div className='reject-inventory-body'>
                        <input type='text' maxLength="250"
                            placeholder='Please enter Rejection Notes'
                            onChange={(e) => handleRejectNotesChange(e)}
                        />
                        <div className='reject-inventory-support-text'>250 characters</div>
                    </div>
                    <div className='reject-button-conatiner'>
                        <Button variant="primary" className="reject-button" onClick={handleRejectAction} caption='Reject' />
                    </div>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}

export default PendingApprovals;