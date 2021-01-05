import React, { useState, useEffect } from 'react';
import HomeCards from '../../components/common/HomeCards'
import { MediaIcon, InventoryAvailableIcon, NewInventoryIcon, InventoryAwaitingAssets } from '../../components/common/SVG';
import { serviceUrlHost } from '../../utils/apiUrls';
import Axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import * as Constants from '../../utils/constants';
import { getUserEmail } from '../../utils/userRolehelper';
import { useHistory } from 'react-router-dom';
import { AlertBox } from '../../components/common';
import './Home.css';

export default ({ Role }) => {
    const history = useHistory();
    const [HomeCardsData, setHomeCardsData] = useState({});
    const userEmail = getUserEmail();
    const [infoMessage, setInfoMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    let apiParams = {};
    // fetch api params based on roles
    switch (Role) {
        case Constants.CMM:
            apiParams.url = serviceUrlHost + '/api/HomePage/GetHomePageDetailsForCMM';
            apiParams.method = 'post';
            apiParams.data = { LoginUserEmail: userEmail };
            break;
        case Constants.MM:
            apiParams.url = serviceUrlHost + '/api/HomePage/GetHomePageDetailsForMM';
            apiParams.method = 'get';
            apiParams.data = null;
            break;
        case Constants.BM:
            apiParams.url = serviceUrlHost + '/api/HomePage/GetHomePageDetailsForBM';
            apiParams.method = 'post';
            apiParams.data = { LoginUserEmail: userEmail };
            break;
        default:
            apiParams = {};
            break;

    }
    useEffect(() => { // added useeffect based on role as the api varies for roles
        setLoading(true); // to show loader
        if (Object.keys(apiParams).length !== 0) {
            Axios({
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': true
                },
                ...apiParams
            })
                .then((res) => {
                    setHomeCardsData({ ...res.data }); // set data in state, to use it in the home cards
                    setLoading(false);
                })
                .catch(error => {
                    setInfoMessage({
                        variant: 'danger',
                        message: 'Error while fetching Home Data.'
                    });
                    setLoading(false);
                
                    setTimeout(() => {
                        setInfoMessage(null);
                    }, 5000);
                });
        }
    }, [Role]);

    const cardObject = () => {
        //console.log(HomeCardsData)
        //const role = 'Media Manager';
        // setting card objects based on role
        let cardObject = [];
        switch (Role) {
            case Constants.CMM:
                cardObject = [
                    { digitColor: '#4BAF50', id: Constants.CREATEINVENTORY, digit: '\u00A0', label: 'Create Inventory', btnColor: '#008240', backgroundBoxColor: 'rgba(75, 175, 80,45%) 0px 0px 8px', icon: <InventoryAwaitingAssets /> },
                    { digitColor: '#9E76F8', id: Constants.PENDINGAPPROVAL, digit: HomeCardsData.PendingApprovalCount, label: 'Inventory Pending Approval', btnColor: '#9E76F8', backgroundBoxColor: ' rgba(158, 118, 248,45%) 0px 0px 8px', icon: <InventoryAvailableIcon /> },
                    { digitColor: '#D8AF04', id: Constants.ASSETDOWNLOAD, digit: HomeCardsData.AssetDownloadCount, label: 'Assets Ready For Download', btnColor: '#D8AF04', backgroundBoxColor: ' rgba(216, 175, 4,46%) 0px 0px 8px', icon: <NewInventoryIcon /> }
                ]
                break;
            case Constants.MM:
                cardObject = [
                    { digitColor: '#4BAF50', id: Constants.ACTIVECAMPAIGN, digit: HomeCardsData.ActiveCampaignsCount, label: 'Active Campaigns', btnColor: '#008240', backgroundBoxColor: 'rgba(75, 175, 80,45%) 0px 0px 8px', icon: <MediaIcon /> },
                    { digitColor: '#9E76F8', id: Constants.AVAILABLEINVENTORY, digit: HomeCardsData.InventoryAvailableCount, label: 'Inventory Available', btnColor: '#9E76F8', backgroundBoxColor: ' rgba(158, 118, 248,45%) 0px 0px 8px', icon: <InventoryAvailableIcon /> },
                    { digitColor: '#D8AF04', id: Constants.NEWINVENTORY, digit: HomeCardsData.NewInventoryCount, label: 'New Inventory', btnColor: '#D8AF04', backgroundBoxColor: ' rgba(216, 175, 4,46%) 0px 0px 8px', icon: <NewInventoryIcon /> }
                ]
                break;
            case Constants.BM:
                cardObject = [
                    { digitColor: '#4BAF50', id: Constants.AWAITINGASSET, digit: HomeCardsData.AwaitingAssetCount, label: 'Inventory Awaiting Assets', btnColor: '#008240', backgroundBoxColor: 'rgba(75, 175, 80,45%) 0px 0px 8px', icon: <InventoryAwaitingAssets /> },
                ]
                break;

            default:
                cardObject = [];
                break;
        }
        return cardObject;
    }

    const clickedOnNext = (type) => {
        //alert('you clicked next page btn');
        // when next arrow is clicked
        history.push('/' + type);
    };

    return (
        <div className="message-adjust">
            <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} />
            <Row>
                {cardObject(HomeCardsData).map((cardData, index) => (
                    <Col key={index} xs={12} sm={4} md={4} className="ipadClass">
                        <HomeCards isLoading={loading}
                            digitColor={cardData.digitColor}
                            digit={cardData.digit === null ? 0 : cardData.digit}
                            label={cardData.label}
                            btnColor={cardData.btnColor}
                            backgroundBoxColor={cardData.backgroundBoxColor}
                            icon={cardData.icon}
                            onClickHandler={clickedOnNext}
                            id={cardData.id}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    )
}