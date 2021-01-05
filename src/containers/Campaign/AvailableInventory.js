import React, { useEffect, useState, Fragment } from 'react';
import InventoriesCard from '../../components/common/InventoriesCard';
import { PrimaryDropdown, InventoriesFilter, AlertBox, Pagination } from '../../components/common';
// import { EditIcon, TickIconBlack } from '../../components/common/SVG';
import { Row, Col, Spinner, Modal } from 'react-bootstrap';
import { serviceUrlHost } from '../../utils/apiUrls';
import Axios from 'axios';
import './AvailableInventory.css';
import { getUserEmail } from '../../utils/userRolehelper';

import EditIcon from '../../styles/images/Edit_Pencil.svg';
import TickIconBlack from '../../styles/images/tick_black.svg';
import TimeLine from '../../components/common/TimeLine/TimeLineWrapper';
import html2canvas from 'html2canvas';
import jsPDF from 'jsPDF';
import { CardViewIcon, CardViewSelectedIcon, TimelIneViewIcon, TimelIneViewSelectedIcon, DownloadPDFIcon } from '../../components/common/SVG';

const userEmail = getUserEmail();

const filterByOptions = [
    { ID: 'CustomerName', Name: 'Customer Name' },
    { ID: 'VenueType', Name: 'Venue Type' },
    { ID: 'LocationDetails', Name: 'Location' },
    { ID: 'MediaChannel', Name: 'Media Channel' },
    { ID: 'InventoryStatus', Name: 'Status' }
];

const statusFilterOptions = [{
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

const AvailableInventory = (props) => {
    const inventoriesCardDefaultProps = {
        actionEnabled: false,
        leftActionimg: {},
        rightActionImg: {},
        showAssetInfo: false,
        campaignHeaderEnabled: false,
        inventoryCardEnabled: true,
        shadow: true,
        holdInventory: true,
        holdInventoryObject: {
            startDate: '',
            endDate: '',
            value: '',
            callBack: (data) => {
                let startDate = data.from;
                let endDate = data.to;
                let runLoop = true;
                let holdRangeDates = [];
                let temp = {
                    StartDate: '',
                    EndDate: ''
                };
                while (runLoop) {
                    if (startDate > endDate) {
                        runLoop = false;
                        if (temp.StartDate !== '' && temp.EndDate === '') {
                            temp.EndDate = temp.StartDate;
                        }
                        holdRangeDates.push(temp);
                    } else {
                        if (dateisInArrayOfDates(data.disbaledDaysinRange, startDate)) {
                            if (temp.StartDate !== '' && temp.EndDate !== '') {
                                holdRangeDates.push(temp);
                            } else if (temp.StartDate !== '' && temp.EndDate === '') {
                                temp.EndDate = temp.StartDate;
                                holdRangeDates.push(temp);
                            }
                            temp = {
                                StartDate: '',
                                EndDate: ''
                            };
                        } else {
                            temp.StartDate === '' ?
                                temp.StartDate = getFormatedDate(startDate) :
                                temp.EndDate = getFormatedDate(startDate);
                        }
                    }
                    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
                }

                console.log('holdRangeDates: ', holdRangeDates);
                setCampaignHoldData({
                    ...campaignHoldData,
                    MediaInventoryID: data.id,
                    UserStartDate: getFormatedDate(data.from),
                    UserEndDate: getFormatedDate(data.to),
                    HoldRangeDates: holdRangeDates
                });
                setIsHoldClicked(true);
            }
        },
        data: {}
    }

    const campaignCardDefaultProps = {
        actionEnabled: true,
        leftActionimg: {},
        rightActionImg: {
            icon: EditIcon,
            style: {
                backgroundColor: '#28b407'
            },
            actionHandler: (data) => {
                props.backToCampaignview(false);
                props.editFn(data.campaignID);
            }
        },
        showAssetInfo: false,
        campaignHeaderEnabled: true,
        campaignHeaderStyle: {
            backgroundColor: '#BCDCEE'
        },
        inventoryCardEnabled: false,
        onlyCampaign: true,
        shadow: false,
        data: {}
    }

    const campaignHoldObj = {
        "CampaignID": props.campaignCardData.CampaignID,
        "MediaInventoryID": '',
        "UserStartDate": "",
        "UserEndDate": "",
        "HoldRangeDates": [],
        "CreatedBy": userEmail,
        "ModifiedBy": userEmail,
        "CreatedDate": "",
        "ModifiedDate": ""
    }

    const [campaignHoldData, setCampaignHoldData] = useState(campaignHoldObj);
    const [campaignCardProps, setCampaignCardProps] = useState(campaignCardDefaultProps);
    const [isHoldClicked, setIsHoldClicked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inventoryCardData, setInventoryCardData] = useState(null);
    const [inventoryCardOriginalData, setInventoryCardOriginalData] = useState();
    const [resultDataLength, setResultDataLength] = useState(0);
    const [filterById, setFilterById] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [noData, setNoData] = useState(false);
    const [infoMessage, setInfoMessage] = useState(null);
    const [view, setView] = useState('Card');

    const [cardCount, setcardCount] = useState(50);
    const [fromToCount, setFromToCount] = useState({});
    const [paginatedData, setPaginatedData] = useState({});
    const [isSamePage, setSamePage] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [statusOptions, setStatusOptions] = useState({ InventoryStatus: statusFilterOptions });
    const [timeLineStatusFilter, setTimeLineStatusFilter] = useState(false);
    const [downloadPdfShow, setDownloadPdfShow] = useState(false);

    const getWindowWidth = () => {
        const DeviceWidth = window.outerWidth;
        return DeviceWidth;
    }
    const [windowWidth, setWindowWidth] = useState(getWindowWidth());


    const handleFilterBy = (e) => {
        setFilterById(e.target.value);
        setFilterText('');
        setInventoryCardData(inventoryCardOriginalData);
        setResultDataLength(inventoryCardOriginalData.length);
    }

    const handleFilterTextChange = (e) => {
        if (filterById) {
            if (filterById === 'InventoryStatus') {
                if (e.includes('All')) {
                    setStatusOptions(
                        {
                            ...statusOptions,
                            'InventoryStatus': statusOptions['InventoryStatus'].map((item) => {
                                const isDisabled = item.ID !== 'All' ? true : false;
                                item.disabled = isDisabled;
                                return item;
                            })
                        })
                } else {
                    setStatusOptions(
                        {
                            ...statusOptions,
                            'InventoryStatus': statusOptions['InventoryStatus'].map((item) => {
                                item.disabled = false;
                                return item;
                            })
                        })
                }
            }
            const text = ['InventoryStatus'].indexOf(filterById) !== -1 ? (e.includes('All') ? ['All'] : e) :
                ['VenueType', 'MediaChannel'].indexOf(filterById) !== -1 && e.target.currentObject ? e.target.currentObject.Name : e.target.value;
            filterAvailableInventories(filterById, text);
        }
        setFilterText(filterById === 'InventoryStatus' ? (e.includes('All') ? ['All'] : e) : e.target.value);
    }

    const filterAvailableInventories = (key, value) => {
        let filteredData = inventoryCardOriginalData;
        if (key && value && key === 'InventoryStatus') {
            setTimeLineStatusFilter(true);
        } else {
            setTimeLineStatusFilter(false);
        }
        if (key === 'none') {
            setInventoryCardData(inventoryCardOriginalData);
            setResultDataLength(inventoryCardOriginalData.length);
            return false;
        } else if (value !== '') {
            filteredData = inventoryCardOriginalData.filter((data, i) => {
                if (key === 'InventoryStatus') {
                    if (value.includes('All')) {
                        return ['Available', 'Hold', 'Locked'].indexOf(data[key]) !== -1;
                    } else if (value.length > 0) {
                        return value.indexOf(data[key]) !== -1;
                    } else {
                        return true;
                    }
                } else if (data[key]) {
                    return (data[key].toLowerCase().indexOf(value.toLowerCase()) !== -1);
                }
                return false;
            });
        }

        setInventoryCardData(filteredData);
        setResultDataLength(filteredData.length);
    }

    const getViewAvailableInventory = () => {
        setInventoryCardData([]);
        setLoading(true);
        Axios({
            url: serviceUrlHost + '/api/Inventory/GetAvailableInventories',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: props.inventoriesSearchData
        }).then((response) => {
            if (response.data) {
                setResultDataLength(response.data.length)
                setInventoryCardData(response.data);
                setInventoryCardOriginalData(response.data);
                setLoading(false);
                moveToTop();
                setFilterById('');
                setFilterText('');
            }
        }).catch((error) => {
            console.log(error);
            setLoading(false);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while fetching Available Inventory.'
            });

            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });;
    }

    const moveToTop = () => {
        window.scroll({
            top: 0,
            left: 0
        });
    }

    const dateisInArrayOfDates = (dateArray, date) => {
        return dateArray.some(item => item.getTime() === date.getTime());
    }

    const getFormatedDate = (date) => {
        return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
    }

    const getCustomFormatedDate = (fdate) => {
        const date = new Date(fdate);
        const fromday = date.getDate();
        const frommonth = date.getMonth() + 1;
        const fromyear = date.getFullYear();
        return frommonth + '/' + fromday + '/' + fromyear
    }

    const changeView = (val) => {
        setView(val);
    }

    const downloadPdf = () => {
        window.scroll({
            top: 0,
            left: 0
        });
        const input = document.getElementById('timeline-view');
        html2canvas(input, {
            scale: 1
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/PNG', 1.0);

            let imgWidth = 295;
            let pageHeight = 210;
            let imgHeight = canvas.height * imgWidth / canvas.width + 10;
            let heightLeft = imgHeight;
            let position = 10;

            const pdf = new jsPDF({
                orientation: 'landscape',
            });

            pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            if (heightLeft >= 0) {
                const headerInput = document.getElementById('tl-layout-sidebar-header');
                const periodInput = document.getElementById('tl-layout-header');
                html2canvas(headerInput, { scale: 1 }).then((header) => {
                    const headerImg = header.toDataURL('image/png', 1.0);
                    html2canvas(periodInput, { scale: 1 }).then((period) => {
                        const periodImg = period.toDataURL('image/png', 1.0);
                        while (heightLeft >= 0) {
                            position = heightLeft - imgHeight + 36;
                            pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
                            pdf.setFillColor(255, 255, 255);
                            pdf.rect(0, 0, 300, 10, 'F');
                            pdf.addImage(headerImg, 'PNG', 5, 10, 37.5, 19);
                            pdf.addImage(periodImg, 'PNG', 43, 10, 257, 19);
                            heightLeft -= pageHeight - 27;
                        }
                        pdf.save(`Inventory-Time-Line-View-${new Date().getTime()}.pdf`);
                        setDownloadPdfShow(false);
                    })
                });
            } else {
                pdf.save(`Inventory-Time-Line-View-${new Date().getTime()}.pdf`);
                setDownloadPdfShow(false);
            }
        });
    }

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
        if (isHoldClicked) {
            setIsHoldClicked(false);
            setLoading(true);
            console.log(campaignHoldData);
            Axios({
                url: serviceUrlHost + '/api/Campaign/HoldCampaign',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': true
                },
                data: campaignHoldData
            }).then((response) => {
                setLoading(false);
                getViewAvailableInventory();
                moveToTop();
                setInfoMessage({
                    variant: 'success',
                    message: 'Inventory has been put on hold successfully.',
                    icon: TickIconBlack
                });

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            }).catch((error) => {
                console.log(error);
                setLoading(false);
                setInfoMessage({
                    variant: 'danger',
                    message: 'Error occured while on Hold..'
                });

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            });;
        }

    }, [isHoldClicked]);

    useEffect(() => {
        setCampaignCardProps({
            ...campaignCardProps,
            data: props.campaignCardData
        })
    }, []);

    useEffect(() => {
        getViewAvailableInventory();
    }, [props.inventoriesSearchData]);

    useEffect(() => {
        if (!resultDataLength && view === 'Card') {
            setNoData(true);
        } else {
            setNoData(false);
        }
    }, [resultDataLength]);

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

    return (
        <Fragment>
            <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} />
            <div className='available-inventory-container'>
                <InventoriesCard {...campaignCardProps} />
                <div className='available-inventory'>
                    {inventoryCardOriginalData && inventoryCardOriginalData.length > 0 ?
                        <Row>
                            <Col md={(windowWidth >= 768 && windowWidth <= 1024) ? 12 : null} >
                                <div className='available-inventory-title'>Available Inventory</div>
                                {view === 'Card' && <div className='available-inventory-result'>{resultDataLength} Results</div>}
                            </Col>
                            <Col xs={2} md={(windowWidth >= 768 && windowWidth <= 1024) ? 6 : 2} className='filterBy'>
                                <PrimaryDropdown
                                    value={filterById}
                                    label=""
                                    placeholder="Filter By"
                                    options={filterByOptions}
                                    searchOptionRequired={true}
                                    onChange={e => handleFilterBy(e)}
                                />
                            </Col>
                            <Col xs={2} md={(windowWidth >= 768 && windowWidth <= 1024) ? 6 : 2} className='filterType'>
                                <InventoriesFilter
                                    filterType={filterById}
                                    onChange={e => handleFilterTextChange(e)}
                                    value={filterText}
                                    statusOptions={statusOptions} />
                            </Col>
                        </Row>
                        : <Row>
                            <Col md={(windowWidth >= 768 && windowWidth <= 1024) ? 12 : null} >
                                <div className='available-inventory-title'>Available Inventory</div>
                                <div className='available-inventory-result'>{resultDataLength} Results</div>
                            </Col>
                        </Row>}
                    {/* show pagination only if data is present */}
                    {view === 'Card' && inventoryCardData && inventoryCardData.length > 0 &&
                        <div className='ai-pagination-container'>
                            <Pagination data={inventoryCardData} itemsCount={inventoryCardData.length} onPageChange={getPaginatedData} cardCount={cardCount}
                                fromToCount={fromToCount} showSamePage={isSamePage} activePageItem={activePage} />
                        </div>
                    }
                    <div className='change-view'>
                        {view === 'timeline' && <span id='download-pdf' onClick={() => {
                            setDownloadPdfShow(true);
                            setTimeout(() => {
                                downloadPdf();
                            }, 100)
                        }}><DownloadPDFIcon /></span>}
                        {windowWidth >= 768 && <>
                            <span id='Card' onClick={(e) => changeView('Card')}>
                                {view === 'Card' ? <CardViewSelectedIcon /> : <CardViewIcon />}
                            </span>
                            <span id='timeline' onClick={(e) => changeView('timeline')}>
                                {view === 'timeline' ? <TimelIneViewSelectedIcon /> : <TimelIneViewIcon />}
                            </span>
                        </>}
                    </div>
                    <div className='available-inventory-cards-container'>
                        <div className="dotted_line"></div>

                        {loading && <div className='available-inventory-loading-container'>
                            <Spinner animation="border" variant="primary" />
                        </div>}
                        {view === 'Card' && paginatedData && paginatedData.length > 0 && paginatedData.map((card, i) => {
                            inventoriesCardDefaultProps.data = card;
                            inventoriesCardDefaultProps.holdInventoryObject.startDate = getCustomFormatedDate(campaignCardProps.data.CampaignStartDate);
                            inventoriesCardDefaultProps.holdInventoryObject.endDate = getCustomFormatedDate(campaignCardProps.data.CampaignEndDate);

                            return <div className='available-inventory-card' key={i}>
                                <InventoriesCard {...inventoriesCardDefaultProps} />
                            </div>
                        })}
                        {noData && <div className='inventory-no-data'>No Inventory Found.</div>}
                        {view === 'timeline' &&
                            <div className="no-inventory">
                                {
                                    inventoriesCardDefaultProps.holdInventoryObject.startDate = getCustomFormatedDate(campaignCardProps.data.CampaignStartDate),
                                    inventoriesCardDefaultProps.holdInventoryObject.endDate = getCustomFormatedDate(campaignCardProps.data.CampaignEndDate),
                                    <TimeLine inventoryData={inventoryCardData} id='timeline-view' inventoryCardProps={inventoriesCardDefaultProps} campaignData={props.campaignCardData} statusFilter={timeLineStatusFilter} statusSearchParam={filterText} />
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
            <Modal show={downloadPdfShow} onHide={() => { }} centered dialogClassName="download-progress-modal-30w">
                <div className='download-progress-text'><Spinner animation="grow" size="sm" role="status" variant="info" /> Creating PDF...</div>
            </Modal>
        </Fragment>
    );

}

export default AvailableInventory;