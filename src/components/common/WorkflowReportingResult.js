import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import Button from './Button';
import PrimaryDropdown from './PrimaryDropdown';
import InventoriesFilter from './InventoriesFilter';
import './WorkflowReportingResult.css';
import { serviceUrlHost } from '../../utils/apiUrls';
import CustomLabel from './CustomLabel';
import InventoriesStatus from './InventoriesStatus';
import { exportToExcel } from '../../components/common/ExportWorkflow';
import { Pagination, Accordion } from '../../components/common';

export default ({ data, Role }) => {
    const [filterBy, setFilterBy] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState({});
    const [filterText, setFilterText] = useState('');
    //const [isChecked, setisChecked] = useState(false);
    const [inventoryCardsData, setinventoryCardsData] = useState(data);
    const [filteredData, setfilteredData] = useState(null);
    const [srchText, setSrchText] = useState('');

    const [cardCount, setcardCount] = useState(10);
    const [fromToCount, setFromToCount] = useState({});
    const [paginatedData, setPaginatedData] = useState({});
    const [isSamePage, setSamePage] = useState(false);
    const [activePage, setActivePage] = useState(1);

    const filterOptions = [
        { ID: 'CustomerName', Name: 'Customer Name' },
        { ID: 'CampaignName', Name: 'Campaign Name' },
        { ID: 'InventoryStatus', Name: 'Status' }
    ];

    const downoadAllData = () => {
        exportToExcel(data, 'Workflow Reporting');
    };

    const handleChange = (e, type) => {

        if (filterBy) {
            const searchTxt = type === 'CampaignName' && e.target.currentObject ? e.target.currentObject.Name : e.target.value;
            let filterData = filterSearch(filterBy, searchTxt); // get the filterby and ischecked from state
            setSrchText(searchTxt);
            setfilteredData(filterData);
        }
        setFilterText(e.target.value);
    };

    const filterSearch = (type, text) => {
        let filterData = JSON.parse(JSON.stringify(inventoryCardsData)); // deep copy.. 
        if (type && text) {
            filterData = filterData.filter((obj) => {
                if (obj[type]) {
                    return obj[type].toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1;
                } else if (obj.Inventory) {
                    let invData = obj.Inventory;
                    invData = invData.filter((invObj) => {
                        return invObj[type].toLowerCase().indexOf(text.toLowerCase()) !== -1;
                    });
                    if (invData.length > 0) {
                        obj.Inventory = invData;
                        return true;
                    }
                }
            });
        }
        return filterData;
    };

    const handleFilterChange = (e) => {
        setFilterBy(e.target.value);
        setFilterText('');
        const filterData = filterSearch(e.target.value); // if my inventory is selected and the search filter is reset
        setfilteredData(filterData);
    };
    const getDateString = (date) => {
        if (!date) {
            return '';
        } else {
            const dateArray = date.split(';');
            const rtnArr = dateArray.map((item, i) => {
                const temp = item.split(':');
                if (temp.every((val, i, arr) => val === arr[0])) {
                    return temp[0];
                } else {
                    return temp[0] + ' to ' + temp[1];
                }
            })
            return rtnArr.join(', ');
        }
    };

    const getWindowWidth = () => {
        const DeviceWidth = window.outerWidth;
        return DeviceWidth;
    };

    const [windowWidth, setWindowWidth] = useState(getWindowWidth());

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(getWindowWidth())
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    useEffect(() => {
        Axios({
            url: serviceUrlHost + '/api/Inventory/GetInventoryFormDropDownValues',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        })
            .then(res => {
                setDropdownOptions(res.data.reduce((accum, d) => {
                    return {
                        ...accum,
                        [d.Name.replace(' ', '')]: d.MasterTableData,
                    }
                }, {}));

            })
            .catch(error => {
                console.log('fetching dropdowns', error);
            });
    }, []);

    useEffect(() => {
        if (filteredData !== null && filteredData.length >= 0) {
            getPaginatedData(1, cardCount);
            setSamePage(false);
        } // whenever the data is changed, we need to show only the paginated data
    }, [filteredData]);

    const getPaginatedData = (pageNum, cardCount) => {
        const startCard = pageNum === 1 ? 0 : (pageNum - 1) * cardCount; // based on number of records to be shown
        const endCard = filteredData.length > (startCard + cardCount) ? (startCard + cardCount) : filteredData.length; // since obj starts from position 0
        const fromTo = { 'from': startCard + 1, 'to': endCard };
        setFromToCount(fromTo); // as card length always starts from 0
        setPaginatedData(filteredData.slice(startCard, endCard));
        setActivePage(pageNum);
    };

    useEffect(() => {
        setFilterBy('');
        setFilterText('');
        setfilteredData(data); // initially set data for filtered data as filters are none by default
        setinventoryCardsData(data);
    }, [data]);

    return (
        <div className="Workflow-report-result-wrapper">
            {/* show pagination only if data is present */}


            <Row className="displayBlock">
                <Col>
                    {/* show pagination only if data is present */}
                    {filteredData && filteredData.length > 0 &&
                        <div className="pagination_wrapper">
                            <Pagination data={filteredData} itemsCount={filteredData.length} onPageChange={getPaginatedData} cardCount={cardCount}
                                fromToCount={fromToCount} showSamePage={isSamePage} activePageItem={activePage} />
                        </div>}
                </Col>
                <Col xs={2}>
                    <PrimaryDropdown
                        value={filterBy}
                        onChange={e => handleFilterChange(e)}
                        options={filterOptions}
                        placeholder={'Filter By'}
                        listHeight="filterHeight"
                    />
                </Col>

                <Col xs={2} className="wf-filterText">
                    <InventoriesFilter
                        filterType={filterBy}
                        dropdownOptions={dropdownOptions}
                        onChange={e => handleChange(e, filterBy)}
                        value={filterText} />
                </Col>

                <Button style={{ margin: 0 }} caption="Download" variant="primary" onClick={downoadAllData} /> {/* onClick={handleSearchClick} */}
                {paginatedData && paginatedData.length > 0 &&
                    <div className="campaign-Card">
                        <Row className="heading">
                            <div className="campaign-styling">
                                <Col className="first-col">Campaign</Col>
                            </div>
                            <div className="status-styling">
                                <Col xs={2} className="padding-1rem"> Inventory</Col>
                                <Col xs={1} className="padding-1rem"></Col>
                                <Col xs={3} className="padding-1rem">Status</Col>
                                {/* <Col xs={1} className="padding-1rem"></Col> */}
                                <Col xs={2} className="padding-1rem">Date Assigned</Col>
                                <Col xs={4} className="padding-1rem">Owner</Col>
                            </div>
                        </Row>

                        {paginatedData.map((i, index) => {

                            let startDate = i.CampaignStartDate.split(' ');
                            let campaignStartDate = startDate[0];

                            let endDate = i.CampaignEndDate.split(' ');
                            let campaignEndDate = endDate[0];

                            return <Row key={index}>

                                <div className="first-col-data">
                                    <Col style={{ padding: 0 }}>
                                        <CustomLabel name="Campaign Name" value={i.CampaignName} />
                                        <CustomLabel name="Campaign Start Date" value={campaignStartDate} />
                                        <CustomLabel name="Campaign End Date" value={campaignEndDate} />
                                    </Col>
                                </div>
                                <div className="second-col-data second-styling" >
                                    {i.Inventory.map((a, k) => {

                                        const inventoryAvailabilityDate = a.InventoryAvailabilityStartDate + " to " + a.InventoryAvailabilityEndDate;

                                        const owners = [];
                                        if (a.CustomerMarketingManager.length > 0) {
                                            const obj = { label: 'Customer Marketing Manager' };

                                            obj.content = a.CustomerMarketingManager.map((b, q) => {
                                                return <CustomLabel maxwidth={'90%'} name={b.OwnerDisplayName} value={b.OwnerEmailID} tooltipEnabled={true} key={q} />
                                            })

                                            owners.push(obj);
                                        }

                                        if (a.MediaManager.length > 0) {
                                            const obj = { label: 'Media Manager' };

                                            obj.content = a.MediaManager.map((b, q) => {
                                                return <CustomLabel maxwidth={'90%'} name={b.OwnerDisplayName} value={b.OwnerEmailID} tooltipEnabled={true} key={q} />
                                            })

                                            owners.push(obj);
                                        }

                                        if (a.BrandManager.length > 0) {
                                            const obj = { label: 'Brand Manager' };

                                            obj.content = a.BrandManager.map((b, q) => {
                                                return <CustomLabel maxwidth={'90%'} name={b.OwnerDisplayName} value={b.OwnerEmailID} tooltipEnabled={true} key={q} />
                                            })

                                            owners.push(obj);
                                        }


                                        return <Row key={k}>
                                            <Col xs={3} className="padding-1rem-col">
                                                <CustomLabel name="Customer Name" value={a.CustomerName} />
                                                <br /><br />
                                                <CustomLabel name="Inventory Availability" tooltipEnabled={true} value={inventoryAvailabilityDate} />
                                            </Col>
                                            <Col xs={3} className="padding-1rem-col status">
                                                <Row>
                                                    <Col xs={(windowWidth >= 768 && windowWidth <= 1024) ? 12 : 4}  style={{ padding: 0 }}><CustomLabel name="" value={<InventoriesStatus status={a.InventoryStatus} />} > </CustomLabel> </Col>
                                                    <Col xs={(windowWidth >= 768 && windowWidth <= 1024) ? 12 : 8}
                                                        className="row-styling">
                                                        <CustomLabel name="" value={a.CurrentStatus} tooltipEnabled={true} wrap={true} />
                                                    </Col>
                                                    <Col xs={12} className="column-styling">
                                                        <CustomLabel
                                                            name={(a.InventoryStatus === 'Hold') ? 'Inventory Hold Dates' : (a.InventoryStatus === 'Locked') ? 'Inventory Locked Dates' : (a.InventoryStatus === 'Rejected') ? 'Inventory Available Dates' : ''}
                                                            value={(a.InventoryStatus === 'Hold') ? getDateString(a.InventoryHoldDates) : (a.InventoryStatus === 'Locked') ? getDateString(a.InventoryLockedDates) : (a.InventoryStatus === 'Rejected') ? getDateString(a.InventoryAvailableDates) : ''} tooltipEnabled={true} />
                                                    </Col>
                                                </Row>

                                            </Col>
                                            {/* <Col xs={1} className="padding-1rem-col"> <CustomLabel name="" value={a.CurrentStatus}  tooltipEnabled={true}/></Col> */}
                                            <Col xs={2} className="padding-1rem-col"> <CustomLabel name="" value={a.DateAssigned} tooltipEnabled={true} /> </Col>
                                            <Col xs={4} className="padding-1rem-col">
                                                <Accordion panels={owners} />
                                            </Col>
                                        </Row>
                                    })
                                    }
                                </div>
                            </Row>
                        })
                        }
                    </div>
                }
            </Row>
            {paginatedData && paginatedData.length === 0 &&
                <div className="dotted-styling">
                    <div className="dotted_line"></div>
                    <div className="no-results">No data found</div>
                </div>
            }
        </div>
    )
}
