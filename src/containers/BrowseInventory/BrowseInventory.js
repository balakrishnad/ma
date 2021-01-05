import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import { Row, Col, Card, Modal, Spinner } from 'react-bootstrap';
import {
    PrimaryDropdown, SwitchButton, Button, Pagination, ExportAllIcon,
    InventoriesFilter, AlertBox, BackToIcon
} from '../../components/common';
import 'bootstrap/dist/css/bootstrap.min.css';
import BrowseInventorySearch from './BrowseInventorySearch';
import InventoriesCard from '../../components/common/InventoriesCard';
import ViewAssetInfo from '../../components/common/ViewAssetInfo';
import './BrowseInventory.css';
import cloneInventory from '../../styles/images/CloneCopy_Icon.svg';
import downloadIcon from '../../styles/images/Download__Icon.svg';
import editIcon from '../../styles/images/Edit_Pencil.svg';
import deleteIcon from '../../styles/images/Delete_Icon.svg';
import tickBlackIcon from '../../styles/images/tick_black.svg';
import { serviceUrlHost } from '../../utils/apiUrls';
import { getUserEmail } from '../../utils/userRolehelper';
import * as Constants from '../../utils/constants';
import CreateModifyAssetUpload from '../../components/common/CreateModifyAssetUpload';
import ThumbnailUpload from '../../components/common/ThumbnailUpload';
import TickIconBlack from '../../styles/images/tick_black.svg';
import CreateInventory from './../CreateInventory/CreateInventory';
import { exportToExcel } from '../../components/common/ExportCSV';
import TimeLine from '../../components/common/TimeLine/TimeLineWrapper';
import html2canvas from 'html2canvas';
import jsPDF from 'jsPDF';
import { CardViewIcon, CardViewSelectedIcon, TimelIneViewIcon, TimelIneViewSelectedIcon, DownloadPDFIcon } from '../../components/common/SVG';

export default ({ Role }) => {
    const [inventoryCardsData, setinventoryCardsData] = useState([]);
    const [filteredData, setfilteredData] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [filterBy, setFilterBy] = useState('');
    const [isChecked, setisChecked] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState({});
    const [infoMessage, setInfoMessage] = useState(null);
    const userEmail = getUserEmail();
    const [srchText, setSrchText] = useState('');
    const [searchObj, setSearchObj] = useState({});
    const [show, setShow] = useState(false);
    const [editAsset, setEditAsset] = React.useState(false);
    const [uploadAssetObject, setUploadAssetObject] = useState(defaultUploadModifyObj);
    const [viewAssetInfo, setViewAssetInfo] = useState(false);
    const [assetDetailsObj, setAssetDetailsObj] = useState(defaultAssetInfo);
    const [thumbnailObject, setThumbnailObject] = useState(defaulThumbnailUploadObj);
    const [showThumbnailModal, setShowThumbnailModal] = useState(false);
    const [cardCount, setcardCount] = useState(50);
    const [fromToCount, setFromToCount] = useState({});
    const [paginatedData, setPaginatedData] = useState({});
    const [isCreateInventory, setIsCreateInventory] = useState(false);
    const [editData, setEditData] = useState(null);
    const [inventoryAction, setInventoryAction] = useState('');
    const [inventoryTitle, setinventoryTitle] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [mediaInventoryId, setMediaInventoryId] = useState('');
    const [deleteConfirmMsg, setDeleteConfirmMsg] = useState('');
    const serviceURL = Role === Constants.MM ? serviceUrlHost + '/api/Inventory/SearchInventoryForMM' : serviceUrlHost + '/api/Inventory/SearchInventoryForCMM';
    const [isSamePage, setSamePage] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [exportData, setExportData] = useState(null);
    const [exportFileName, setExportFileName] = useState('Browse Inventory');
    const [view, setView] = useState('Card');
    const [timeLineStatusFilter, setTimeLineStatusFilter] = useState(false);
    const [downloadPdfShow, setDownloadPdfShow] = useState(false);
    const [loading, setLoading] = useState(true);


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


    const getWindowWidth = () => {
        const DeviceWidth = window.outerWidth;
        return DeviceWidth;
    }
    const [windowWidth, setWindowWidth] = useState(getWindowWidth());

    const filterOptions = [
        { ID: 'CustomerName', Name: 'Customer Name' },
        { ID: 'VenueType', Name: 'Venue Type' },
        { ID: 'LocationDetails', Name: 'Location' },
        { ID: 'MediaChannel', Name: 'Media Channel' },
        { ID: 'CampaignName', Name: 'Campaign Name' },
        { ID: 'InventoryStatus', Name: 'Status' }
    ];
    const defaultUploadModifyObj = {
        MediaInventoryId: '',
        AssetId: '',
        CampaignId: '',
        ExternalLink: '',
        CreatedBy: '',
        ModifiedBy: '',
        CreatedDate: '',
        ModifiedDate: '',
        ModificationNotes: ''
    }

    const defaulThumbnailUploadObj = {
        MediaInventoryId: '',
        AssetId: '',
        CampaignId: '',
        ModifiedBy: '',
        CreatedDate: '',
        ModifiedDate: ''
    }

    const actionIcons = (Role === Constants.MM) ? {
        leftActionimg: {},
        rightActionImg: {
            icon: downloadIcon,
            style: {
                backgroundColor: '#28b407',
                paddingLeft: '3px'
            },
            actionHandler: (data) => {
                let downloadData = [];
                downloadData.push(data);
                exportToExcel(downloadData, exportFileName);

            }
        }
    } : ((Role === Constants.ADMIN || Role === Constants.CMM) ? {
        leftActionimg: {
            icon: cloneInventory,
            style: {
                backgroundColor: '#28b407',
                paddingLeft: '3px'
            },
            actionHandler: (data) => {
                navigateInventoryPage(data.MediaInventoryId);
                setInventoryAction('Clone');
                setinventoryTitle('Clone Inventory');
            }
        },
        rightActionImg: {
            icon: editIcon,
            style: {
                backgroundColor: '#28b407',
                paddingLeft: '3px'
            },
            actionHandler: (data) => {
                navigateInventoryPage(data.MediaInventoryId);
                setInventoryAction('Edit');
                setinventoryTitle('Edit Inventory');
            }
        },
        deleteActionImg: {
            icon: deleteIcon,
            style: {
                backgroundColor: '#d53d01',
                paddingLeft: '5px'
            },
            actionHandler: (data) => {
                setMediaInventoryId(data.MediaInventoryId);

                if (!deleteConfirm) {
                    setDeleteConfirm(true)
                }
                if (data.status === 'Hold' || data.status === 'Locked') {
                    setDeleteConfirmMsg("The association of selected Inventories with all campaigns and assets will be deleted with this action.");

                }
                else {
                    setDeleteConfirmMsg('');
                }
            }
        }
    } : {
            leftActionimg: {
                icon: cloneInventory,
                style: {
                    backgroundColor: '#28b407',
                    paddingLeft: '3px'
                },
                actionHandler: (data) => {
                    navigateInventoryPage(data.MediaInventoryId);
                    setInventoryAction('Clone');
                    setinventoryTitle('Clone Inventory');
                }
            },
            rightActionImg: {
                icon: editIcon,
                style: {
                    backgroundColor: '#28b407',
                    paddingLeft: '3px'
                },
                actionHandler: (data) => {
                    navigateInventoryPage(data.MediaInventoryId);
                    setInventoryAction('Edit');
                    setinventoryTitle('Edit Inventory');
                }
            },
        });
    const handleDeleteNo = () => {
        setDeleteConfirm(false);
    };
    const handleDeleteYes = () => {
        deleteInventory(mediaInventoryId);
    };

    const deleteInventory = (mediaInventoryId) => {

        Axios({
            url: serviceUrlHost + '/api/Inventory/DeleteMediaInventory/' + mediaInventoryId,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        })
            .then(res => {
                moveToTop();
                setDeleteConfirm(false);
                setInfoMessage({
                    variant: 'success',
                    message: 'Inventory has been deleted successfully',
                    icon: tickBlackIcon
                });
                handleSearch(searchObj);

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            })
            .catch(error => {
                moveToTop();
                setDeleteConfirm(false);
                console.log('deleting MediaInventory', error);
                setInfoMessage({
                    variant: 'danger',
                    message: 'Error occured while deleting Inventory.'
                });

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            });
    }
    const navigateInventoryPage = (mediaInventoryId) => {
        Axios({
            url: serviceUrlHost + '/api/Inventory/GetMediaInventory/' + mediaInventoryId,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        })
            .then(res => {
                setEditData(res.data);
                setIsCreateInventory(true);
            })
            .catch(error => {
                moveToTop();
                console.log('fetching GetMediaInventory', error);
                setInfoMessage({
                    variant: 'danger',
                    message: 'Error occured while fetching Inventory details.'
                });

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            });

    }
    const handleBacktoBrowseInventory = () => {
        setIsCreateInventory(false);
    }
    const successfulBacktoBrowseInventory = () => {
        setIsCreateInventory(false);
        if (inventoryAction === 'Edit') {
            setInfoMessage({
                variant: 'success',
                message: 'Inventory has been updated successfully.',
                icon: TickIconBlack
            });
        }
        else if (inventoryAction === 'Clone') {
            setInfoMessage({
                variant: 'success',
                message: 'Inventory has been cloned successfully.',
                icon: TickIconBlack
            });
        }

        setTimeout(() => {
            setInfoMessage(null);
        }, 5000);
        handleSearch({});
    }
    const fallbackCopyTextToClipboard = (text) => {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  //avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }
    const assetPropsAction = {
        assetLeftActionImage: {
            actionHandler: (param) => {
                if (param === 'Error') {
                    setInfoMessage({
                        variant: 'danger',
                        message: 'Error occured while Updating download count.'
                    });
                }
            }
        },
        assetMiddleActionImage: {
            actionHandler: (data) => {
                setUploadAssetObject({
                    AssetId: data.AssetDetails.AssetID,
                    CampaignId: data.AssetDetails.CampaignId,
                    MediaInventoryId: data.AssetDetails.MediaInventoryId,
                    venueType: data.VenueType,
                    CreatedBy: userEmail,
                    ModifiedBy: userEmail,
                    ModifiedDate: new Date(),
                    ModificationNotes: data.modificationNotes
                });
                setShow(true);
                setEditAsset(true);
            }
        },
        assetRightActionImage: {
            actionHandler: (props) => {
                if (!navigator.clipboard) {
                    fallbackCopyTextToClipboard(props.downloadLink);
                    return;
                }
                navigator.clipboard.writeText(props.downloadLink);
            }
        },
        assetThumbnailActionImage: {
            actionHandler: (data) => {
                setThumbnailObject({
                    AssetId: data.AssetDetails.AssetID,
                    CampaignId: data.AssetDetails.CampaignId,
                    MediaInventoryId: data.AssetDetails.MediaInventoryId,
                    CreatedBy: userEmail,
                    ModifiedBy: userEmail,
                    ModifiedDate: new Date()
                });
                setShowThumbnailModal(true);
            }
        }
    }

    const inventoriesCardProps = {
        actionEnabled: true,
        ...actionIcons,
        showBrandRight: false,
        showAssetInfo: false,
        campaignHeaderEnabled: false, // setting it to false by default, can be reset based on the resp
        campaignHeaderStyle: {
            backgroundColor: '#BCDCEE',
            borderRadius: '10px 10px 0px 0px'
        },
        inventoryCardEnabled: true,
        shadow: false,
        data: {},
        assetProps: {
            ...assetPropsAction,
            viewMoreAssetInfo: (param) => {
                moveToTop();
                setViewAssetInfo(true);
                setAssetDetailsObj({ ...defaultAssetInfo, data: param });
            }
        }
    };

    const defaultAssetInfo = {
        backText: 'Back To Browse Inventory',
        data: {},
        assetProps: assetPropsAction,
        backAction: () => {
            setViewAssetInfo(false);
            setAssetDetailsObj(defaultAssetInfo);
            setSamePage(true);
        }
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
        Axios({
            url: serviceUrlHost + '/api/Inventory/GetInventoryFormDropDownValues',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        })
            .then(res => {
                let dpOpts = res.data.reduce((accum, d) => {
                    return {
                        ...accum,
                        [d.Name.replace(' ', '')]: d.MasterTableData,
                    }
                }, {});
                setDropdownOptions({
                    ...dpOpts,
                    'InventoryStatus': statusFilterOptions
                })
            })
            .catch(error => {
                console.log('fetching dropdowns', error);
            });

        handleSearch({
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
        });
    }, []);
    // when role is selected the page is reset
    useEffect(() => {
        resetAllData();
        setIsCreateInventory(false);
        setViewAssetInfo(false);

        handleSearch({
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
        });
    }, [Role]);

    const resetAllData = () => {
        setinventoryCardsData([]);
        setfilteredData(null);
        setisChecked(false);
        setFilterBy('');
        setFilterText('');
    };
    const downoadAllInventory = () => {
        exportToExcel(exportData, exportFileName);
    };
    const handleSearch = (formData) => {
        setLoading(true);
        if (!!formData.Status && formData.Status !== 'All') {
            setTimeLineStatusFilter(true);
            setSrchText(formData.Status);
        } else {
            setTimeLineStatusFilter(false);
            setSrchText('');
        }

        setSearchObj(formData);
        setfilteredData(null);//to remove the inventory shown previously
        Axios({
            url: serviceURL,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: formData
        }).then((response) => {
            if (response.data) {
                setinventoryCardsData(response.data);
                setfilteredData(response.data);
                setExportData(response.data);
                moveToTop();
                setFilterBy('');
                setFilterText('');
                setisChecked(false);
                setLoading(false);
            }
        }).catch((error) => {
            console.log(error);
            setInfoMessage({
                variant: 'danger',
                message: 'Error while search Inventory.'
            });
            setLoading(false);
            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    };
    const handleChange = (e, type) => {
        if (filterBy) {
            if (type === 'InventoryStatus') {
                if (e.includes('All')) {
                    setDropdownOptions(
                        {
                            ...dropdownOptions,
                            'InventoryStatus': dropdownOptions['InventoryStatus'].map((item) => {
                                const isDisabled = item.ID !== 'All' ? true : false;
                                item.disabled = isDisabled;
                                return item;
                            })
                        })
                } else {
                    setDropdownOptions(
                        {
                            ...dropdownOptions,
                            'InventoryStatus': dropdownOptions['InventoryStatus'].map((item) => {
                                item.disabled = false;
                                return item;
                            })
                        })
                }
            }
            const searchTxt = ['InventoryStatus'].indexOf(type) !== -1 ? (e.includes('All') ? ['All'] : e) :
                ['VenueType', 'MediaChannel', 'CampaignName'].indexOf(type) !== -1 && e.target.currentObject ? e.target.currentObject.Name : e.target.value;
            let filterData = filterSearch(filterBy, searchTxt, isChecked); // get the filterby and ischecked from state
            setSrchText(searchTxt);
            setfilteredData(filterData);
        }
        setFilterText(type === 'InventoryStatus' ? (e.includes('All') ? ['All'] : e) : e.target.value);
    };
    const checkboxChange = (e) => {
        const showMyinventory = !isChecked;
        let filterData = filterSearch(filterBy, srchText, showMyinventory); // getting filterby and srchText from state 
        setfilteredData(filterData);
        setisChecked(showMyinventory);
    };
    const filterSearch = (type, text, showMyinventory) => {
        let filterData = inventoryCardsData;
        if (type && text && type === 'InventoryStatus') {
            setTimeLineStatusFilter(true);
        } else {
            setTimeLineStatusFilter(false);
        }
        if (type && text) {
            filterData = filterData.filter((obj) => {
                if (type === 'InventoryStatus') {
                    if (text.includes('All')) {
                        return ['Available', 'Hold', 'Locked'].indexOf(obj[type]) !== -1;
                    } else if (text.length > 0) {
                        return text.indexOf(obj[type]) !== -1;
                    } else {
                        return true;
                    }
                } else if (obj[type]) {
                    return obj[type].toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1;
                } else if (filterBy === 'CampaignName') {
                    if (obj.CampaignDetails && obj.CampaignDetails.CampaignName) {
                        return obj.CampaignDetails.CampaignName.toLowerCase().indexOf(text.toLowerCase()) !== -1;
                    } else {
                        return false;
                    }
                }
            });
        }
        if (showMyinventory) {
            filterData = filterData.filter((obj) => {
                return obj.CMMContactEmailId === userEmail; // to be changed to user object name
            });
        }
        return filterData;
    };
    const handleFilterChange = (e) => {
        setFilterBy(e.target.value);
        setFilterText('');
        const filterData = filterSearch(e.target.value, '', isChecked); // if my inventory is selected and the search filter is reset
        setfilteredData(filterData);
    };

    const uploadAPICallBack = (status) => {
        if (status === 'Success') {
            setViewAssetInfo(false);
            setAssetDetailsObj(defaultAssetInfo);
            setInfoMessage({
                variant: 'success',
                message: 'Asset has been modified successfully.',
                icon: tickBlackIcon
            });
            handleSearch(searchObj);
        } else {
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while modifying the Asset.'
            });
        }
        setTimeout(() => {
            setInfoMessage(null);
        }, 5000);
    }

    const uploadThumbnailAPICallBack = (status) => {
        if (status === 'Success') {
            setViewAssetInfo(false);
            setThumbnailObject(defaulThumbnailUploadObj);
            setInfoMessage({
                variant: 'success',
                message: 'Thumbnail uploaded successfully.',
                icon: tickBlackIcon
            });
            handleSearch(searchObj);
        } else {
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while uploading the Thumbnail.'
            });
        }
        setTimeout(() => {
            setInfoMessage(null);
        }, 5000);
    }

    const moveToTop = () => {
        window.scroll({
            top: 0,
            left: 0
        });
    };

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

    return (
        <React.Fragment>
            <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} className="browse-invent" />
            <Card.Title className="Title-Mobile sticky-top" id="myHeader">Browse Inventory</Card.Title>
            {loading && <div className='browse-inventory-loading-container'>
                <Spinner animation="border" variant="primary" />
            </div>}
            <div className="Browse-Inventory-wrapper">
                {isCreateInventory &&
                    <div className='view-available-inventory-container'>
                        <div className='back-arrow' onClick={handleBacktoBrowseInventory}>
                            <BackToIcon /><a href="javascript:void(0)">{'Back To Browse Inventory'}</a>
                        </div>
                        <div className="edit-inventory-title">{inventoryTitle}</div>
                        <CreateInventory Role={Role} editData={editData} action={inventoryAction} callBack={successfulBacktoBrowseInventory} />
                    </div>}
                {!viewAssetInfo && !isCreateInventory && <div>
                    <BrowseInventorySearch role={Role} dropdownOptions={dropdownOptions} handleSearch={handleSearch} handleReset={resetAllData} windowWidth={windowWidth} />
                    {filteredData && filteredData.length >= 0 &&
                        <div className="result-container">
                            <Row className="result-header">

                                <Col md={(windowWidth >= 768 && windowWidth <= 1024) ? 12 : null}>
                                    <div className="available-inventory-title">Available Inventory</div>
                                    {view === 'Card' && <div className="no-of-records">{filteredData.length} Results</div>} {/* For showing no of results*/}
                                </Col>

                                {/* {Role === Constants.MM &&
                                    <Col xs={12} md={(windowWidth >= 768 && windowWidth <= 1024) ? 4 : 2} className="export-all">
                                        <a className='exportAllLink hideMobile' onClick={downoadAllInventory}>
                                            Export All
                                        <ExportAllIcon className="all-export"/>
                                        </a>
                                    </Col>
                                } */}

                                <Col className="ipad-spaces" xs={12} md={(windowWidth >= 768 && windowWidth <= 1024) ? 4 : 2}> {/* For showing the filter dropdown*/}
                                    <PrimaryDropdown
                                        value={filterBy}
                                        onChange={e => handleFilterChange(e)}
                                        options={filterOptions}
                                        placeholder={'Filter By'}
                                        listHeight="filterHeight"
                                    />
                                </Col>
                                <Col xs={12} md={(windowWidth >= 768 && windowWidth <= 1024) ? 4 : 2} className="filterText ipad-spaces"> {/* For showing the filter text*/}
                                    <InventoriesFilter
                                        filterType={filterBy}
                                        dropdownOptions={dropdownOptions}
                                        onChange={e => handleChange(e, filterBy)}
                                        value={filterText} />
                                </Col>
                                {Role === Constants.CMM && <Col xs={12} md={(windowWidth >= 768 && windowWidth <= 1024) ? 4 : 2} className="myInventory">
                                    <SwitchButton inpLabel="My inventory" onChange={checkboxChange} checked={isChecked} />
                                </Col>}
                            </Row>
                            {/* show pagination only if data is present */}

                            {view === 'Card' && filteredData && filteredData.length > 0 &&
                                <div className='bi-pagination-container'>
                                    <Pagination data={filteredData} itemsCount={filteredData.length} onPageChange={getPaginatedData} cardCount={cardCount}
                                        fromToCount={fromToCount} showSamePage={isSamePage} activePageItem={activePage} />
                                </div>
                            }

                            <div className='change-view'>
                                {(windowWidth >= 768 && ((view === 'Card' && Role === Constants.MM) || view === 'timeline')) && <span id='download-pdf' onClick={() => {
                                    if (view === 'Card' && Role === Constants.MM) {
                                        downoadAllInventory();
                                    } else {
                                        setDownloadPdfShow(true);
                                        setTimeout(() => {
                                            downloadPdf();
                                        }, 200)
                                    }
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



                            <div className="dotted_line"></div>
                            {/* to show cards  */}
                            {view === 'Card' && <div>{paginatedData && paginatedData.length > 0 ? paginatedData.map((card, i) => {
                                inventoriesCardProps.data = card;
                                if ([Constants.MM, Constants.ADMIN].includes(Role)) {
                                    inventoriesCardProps.data.AssetDetails.SPAssetUrl = null;
                                }
                                inventoriesCardProps.campaignHeaderEnabled = card.AssetDetails.CampaignId ? true : false;
                                inventoriesCardProps.showAssetInfo = card.AssetDetails.AssetID ? true : false;
                                inventoriesCardProps.showBrandRight = card.BrandRightsVerification ? true : false;
                                return <div className='available-inventory-card' key={i}>
                                    <InventoriesCard {...inventoriesCardProps} />
                                </div>
                            })
                                : <div className="no-results">No inventory found</div>}</div>}
                            {view === 'timeline' &&
                                <div style={{ marginTop: '2rem' }}>
                                    <TimeLine
                                        inventoryData={filteredData}
                                        inventoryCardProps={inventoriesCardProps}
                                        statusFilter={timeLineStatusFilter}
                                        statusSearchParam={srchText} />
                                </div>}
                        </div>
                    }
                </div>}

                <CreateModifyAssetUpload
                    showPopUp={show}
                    fileSize={10000000}
                    supportedFileArray={['image/*', 'video/*', 'audio/*']}
                    editAsset={editAsset}
                    popUpControlCallBack={(flag) => { setShow(flag); setEditAsset(false); }}
                    apiCallBack={uploadAPICallBack}
                    uploadAssetObject={uploadAssetObject}
                    role={Role} />
                <ThumbnailUpload
                    showPopUp={showThumbnailModal}
                    fileSize={200000}
                    supportedFileArray={['image/*']}
                    popUpControlCallBack={(flag) => { setShowThumbnailModal(flag); }}
                    apiCallBack={uploadThumbnailAPICallBack}
                    uploadThumbnailObject={thumbnailObject} />

            </div>
            <Modal show={deleteConfirm} onHide={handleDeleteNo} dialogClassName="modal-60w">
                <div >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <div >{'Are you sure to delete this Inventory ?'}</div>
                        </Modal.Title>
                    </Modal.Header>
                </div>
                <Modal.Body>
                    {deleteConfirmMsg && <div >Note : {deleteConfirmMsg}<br /><span className="proceed-msg">{'Do you want to proceed ?'}</span></div>}
                    <div className='delete-button-conatiner'>
                        <Button variant="secondary" onClick={handleDeleteNo} caption='No' />
                        <Button variant="primary" onClick={handleDeleteYes} caption='Yes' />
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={downloadPdfShow} onHide={() => { }} centered dialogClassName="download-progress-modal-30w">
                <div className='download-progress-text'><Spinner animation="grow" size="sm" role="status" variant="info" /> Creating PDF...</div>
            </Modal>
            {viewAssetInfo && <ViewAssetInfo {...assetDetailsObj} />}
        </React.Fragment>
    )
}
