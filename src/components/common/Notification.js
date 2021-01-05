import React, { useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Notification.css';
import {
    HoldNotification, NotificationDeleteIcon, AssetNotification, NotificationLocked, AddUser,
    AvailableReuse, WarningNotification, PendingNotification, RejectionNotification, TickIconBlack
} from './SVG.js';
//import * as Constants from '../../utils/constants';

export default ({ notificationClass, label, date, index, type, onClickHandler, showEmailBody, isRead }) => {
    let icon; // to select the icon based on the status
    if (['Reminder for Pending Approvals', 'Contract Expiring in 2Weeks', 'Contract Expired', 'CampaignExpiry', 'InventoryExpiry'].indexOf(type) !== -1) {
        icon = <WarningNotification />
    } else if (['AssetModifiedbyCMM', 'AssetModifiedbyBM'].indexOf(type) !== -1) {
        icon = <AssetNotification />
    } else {
        switch (type) {
            case 'Hold':
                icon = <HoldNotification />;
                break;
            case 'Available for Reuse':
                icon = <AvailableReuse />;
                break;
            case 'Rejection':
                icon = <RejectionNotification />;
                break;
            // case 'UserRoleChange':
            //     icon = <AssetNotification />;
            //     break;
            case 'Pending Brand Rights Verification':
                icon = <PendingNotification />;
                break;
            case 'DownloadAsset':
                icon = <TickIconBlack />
                break;
            case 'AddUser':
                icon = <AddUser />
            case 'New':
                icon = <HoldNotification />
                break;
            default:
                icon = '';
        }
    }
    const onDelete = (event) => { // when notification is deleted
        event.stopPropagation();
        onClickHandler();
    }
    return (
        <div className={`n-card ` + (isRead ? 'isRead ' : '') + notificationClass} index={index}
            onClick={
                () => {
                    if (window.outerWidth > 767) {
                        showEmailBody()
                    }
                }
            }>
            <Row>
                <Col md={11} xs={9} sm={10} className="para-notification-styling">
                    <div className='notificationIcon'>
                        {icon}
                    </div>
                    <div className="Para-date-styling">
                        <p dangerouslySetInnerHTML={{ __html: label }} />
                        <p><i className="date">{date}</i></p>
                    </div>
                </Col>
                <Col md={1} xs={2} sm={1}>
                    <div className='deleteNotification' onClick={onDelete}>
                        <NotificationDeleteIcon />
                    </div>
                </Col>
            </Row>
        </div>
    )
}