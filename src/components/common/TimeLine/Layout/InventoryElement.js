import React, { useEffect, useState, Fragment } from 'react';
import { getDates } from '../Util/InventoryDateUtil';
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap';
import { Button } from '../../../common';
import InventoriesCard from '../../../common/InventoriesCard';
import ViewAssetInfo from '../../../common/ViewAssetInfo';
import { getUserRole } from '../../../../utils/userRolehelper';
import * as Constants from '../../../../utils/constants';

export default (props) => {
    const { time, inventoryArray, zoom, inventoryCardProps, campaignData, statusFilter, statusSearchParam } = props;

    const inventoriesCardDefaultProps = inventoryCardProps;

    const userRole = getUserRole();

    const defaultAssetInfo = {
        backText: 'Back To Inventory',
        data: {},
        assetProps: inventoriesCardDefaultProps.assetProps,
        backAction: () => {
            setTimeLineViewAssetInfo(false);
            setTimeLineAssetDetailsObj(defaultAssetInfo);
        }
    }

    const [inventoryStatusData, setInventoryStatusData] = useState({});
    const [show, setShow] = useState(false);
    const [inventoryData, setInventoryData] = useState(inventoriesCardDefaultProps);

    const [timeLineViewAssetInfo, setTimeLineViewAssetInfo] = useState(false);
    const [timeLineAssetDetailsObj, setTimeLineAssetDetailsObj] = useState(defaultAssetInfo);

    const getElemStyle = (s, e, status, show) => {
        const end = time.zoom > 1 ? e : new Date(e.setDate(e.getDate() + 1));
        return {
            ...time.toStyleLeftAndWidth(s, end, 5, zoom),
            height: 10,
            backgroundColor: show ? (status === 'Locked' ? '#CE032A' :
                status === 'Available' ? '#008240' :
                    status === 'Hold' ? '#D8AF04' : status === 'BlackedOut' ? 'black' : 'none') : '#e9e9e9',
            cursor: show ? 'pointer' : 'default'
        };
    }

    const getElemLeftStyle = (s) => {
        return {
            ...time.toStyleLeft(s),
        };
    }

    const getStringDate = (date) => {
        const sd = new Date(date).getDate();
        const sm = parseInt(new Date(date).getMonth()) + 1;
        const sy = new Date(date).getFullYear();
        return sm + '/' + sd + '/' + sy;
    }

    const DisplayCampaignName = ({ inventoryObject, status }) => {
        let campaignName = '';
        if (status !== 'BlackedOut' && inventoryObject.CampaignDetails && inventoryObject.CampaignDetails.CampaignID !== null) {
            campaignName = inventoryObject.CampaignDetails.CampaignName;
        } else {
            return null;
        }
        return (<div><strong>Campaign Name: </strong> {campaignName}</div>);
    }

    const handleClose = () => {
        setShow(false);
    }

    const isDateInBetweenCampaign = (start, end) => {
        if (start <= new Date(campaignData.CampaignEndDate) && start >= new Date(campaignData.CampaignStartDate) ||
            end <= new Date(campaignData.CampaignEndDate) && end >= new Date(campaignData.CampaignStartDate)) {
            return true;
        } else {
            return false;
        }
    }

    const getCampaignRelatedStartDate = (start) => {
        const rtnDate = (start >= new Date(campaignData.CampaignStartDate)) ? start : new Date(campaignData.CampaignStartDate);
        return rtnDate;
    }

    const getCampaignRelatedEndDate = (end) => {
        const rtnDate = (end <= new Date(campaignData.CampaignEndDate)) ? end : new Date(campaignData.CampaignEndDate);
        return rtnDate;
    }

    const getMinimumStartDate = () => {
        if(campaignData === null) {
            return new Date(inventoryArray[0].InventoryAvailabilityStartDate);
        }
        let uniqueStartDates = new Set();
        if (Object.keys(inventoryStatusData).length > 0) {
            Object.keys(inventoryStatusData).map((key, index) => {
                inventoryStatusData[key].map((obj, i) => {
                    if (campaignData !== null && obj.start <= new Date(campaignData.CampaignEndDate)
                        && obj.start >= new Date(campaignData.CampaignStartDate)) {
                        uniqueStartDates.add(obj.start);
                    }
                })
            })
        }
        return new Date(Math.min.apply(null, Array.from(uniqueStartDates)));
    }

    const OverLayCustom = (props) => {
        const { i, obj } = props;
        return (<OverlayTrigger
            trigger="hover"
            key={i}
            placement='auto'
            popperConfig={{
                modifiers: {
                    preventOverflow: {
                        enabled: true,
                        priority: ['left', 'right'],
                        padding: 200,
                        boundariesElement: 'window'
                    },
                    hide: { enabled: false }
                }
            }}
            overlay={
                <Popover id={`${i}-popover-positioned-top`}>
                    <Popover.Title as="h3">{obj.inventoryObj.CustomerName}</Popover.Title>
                    <Popover.Content>
                        <div><strong>Start Date: </strong> {getStringDate(obj.start)}</div>
                        <div><strong>End Date: </strong> {getStringDate(obj.end)}</div>
                        <DisplayCampaignName inventoryObject={obj.inventoryObj} status={obj.status}></DisplayCampaignName>
                    </Popover.Content>
                </Popover>
            }
        >
            {props.children}
        </OverlayTrigger>)
    }

    const InventoryChunkElement = ({ obj, i }) => {
        if (campaignData === null) {
            return (<OverLayCustom obj={obj} i={i}>
                <span className="tl-layout-inventory-elemnet-chunk"
                    style={getElemStyle(new Date(obj.start), new Date(obj.end), obj.status, obj.show)}
                    onClick={() => { if (obj.show && obj.status !== 'BlackedOut') showInventory(obj.inventoryObj) }}></span>
            </OverLayCustom>);
        } else if (campaignData !== null && isDateInBetweenCampaign(new Date(obj.start), new Date(obj.end))) {
            return (<OverLayCustom obj={obj} i={i}>
                <span className="tl-layout-inventory-elemnet-chunk"
                    style={getElemStyle(getCampaignRelatedStartDate(new Date(obj.start)), getCampaignRelatedEndDate(new Date(obj.end)), obj.status, obj.show)}
                    onClick={() => { if (obj.show && obj.status !== 'BlackedOut') showInventory(obj.inventoryObj) }}></span>
            </OverLayCustom>);
        } else if (campaignData !== null && !isDateInBetweenCampaign(new Date(obj.start), new Date(obj.end))) {
            return null;
        } else {
            return null;
        }
    }

    const showInventory = (inventory) => {
        setShow(true);
        setTimeLineViewAssetInfo(false);

        if ([Constants.MM, Constants.ADMIN].includes(userRole)) {
            inventory.AssetDetails.SPAssetUrl = null;
        }

        setInventoryData({
            ...inventoriesCardDefaultProps,
            actionEnabled: false,
            campaignHeaderEnabled: inventory.AssetDetails.CampaignId ? true : false,
            showAssetInfo: inventory.AssetDetails.AssetID ? true : false,
            holdInventory: (inventoriesCardDefaultProps.holdInventory && inventory.InventoryStatus === 'Available') ? true : false,
            assetProps: inventory.AssetDetails.AssetID ? {
                ...inventoriesCardDefaultProps.assetProps,
                viewMoreAssetInfo: (param) => {
                    setTimeLineViewAssetInfo(true);
                    setTimeLineAssetDetailsObj({ ...defaultAssetInfo, data: param });
                }
            } : {},
            showBrandRight: inventory.BrandRightsVerification ? true : false,
            data: inventory
        })
    }

    useEffect(() => {
        setInventoryStatusData(getDates(inventoryArray, campaignData, statusFilter, statusSearchParam));
    }, [inventoryArray, statusFilter, statusSearchParam])

    return (
        <Fragment>
            <div>
                <div className="tl-layout-inventory-elemnet-name" style={getElemLeftStyle(getMinimumStartDate())}>{inventoryArray[0].CustomerName}</div>
                <div className="tl-layout-inventory-elemnet">
                    {Object.keys(inventoryStatusData).map((key, index) => {
                        return inventoryStatusData[key].map((obj, i) => {
                            return <InventoryChunkElement obj={obj} i={i} />
                        })
                    })}
                </div>
            </div>
            <Modal show={show} onHide={handleClose} dialogClassName="tl-element-inventory-modal-80w">
                <div className='tl-element-inventory-header'>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <div className='tl-element-inventory-header-title'>Inventory Information</div>
                        </Modal.Title>
                    </Modal.Header>
                </div>
                <Modal.Body>
                    <div className='tl-element-inventory-body'>
                        {!timeLineViewAssetInfo && <InventoriesCard {...inventoryData} />}
                        {timeLineViewAssetInfo && <ViewAssetInfo {...timeLineAssetDetailsObj} />}
                    </div>
                    <div className='tl-element-inventory-button-conatiner'>
                        <Button variant="primary" className="tl-element-inventory-close-button" onClick={handleClose} caption='Close' />
                    </div>
                </Modal.Body>
            </Modal>
        </Fragment>
    );
}