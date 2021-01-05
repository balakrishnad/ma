import React, { useEffect, useState, Fragment } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import { NoNotificationBellIcon } from '../../components/common/SVG';
import { serviceUrlHost } from '../../utils/apiUrls';
import { getUserEmail } from '../../utils/userRolehelper';
import { AlertBox, Notification, NotificationBody, Pagination, Button } from '../../components/common';
import { Modal } from 'react-bootstrap';
import './notifications.css';

const Notifications = ({ getNotificationCount, history }) => {
    const [infoMessage, setInfoMessage] = useState(null);
    const userEmail = getUserEmail();
    const [clearAll, setClearAll] = useState(false);
    const [ncardData, setncardData] = useState({});
    const [show, setShow] = useState(false);
    const [isdeleteMsg, setIsdeleteMsg] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    const [notificationId, setNotificationId] = useState('');
    const [allNotifiIds, setAllNotifiIds] = useState(null);

    //pagination related hook objects
    const [cardCount, setcardCount] = useState(25);
    const [fromToCount, setFromToCount] = useState({});
    const [paginatedData, setPaginatedData] = useState({});
    const [isSamePage, setSamePage] = useState(false);
    const [activePage, setActivePage] = useState(1);

    const onClickDelete = (id) => { // when delete notification is clicked
        setShow(false);
        setIsdeleteMsg(true);
        setNotificationId(id);
        setClearAll(false);
    }

    const deleteNotificationAPI = () => { // delete notification api
        Axios({
            url: serviceUrlHost + '/api/Notifications/DeleteNotificationById',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: {
                "NotificationID": notificationId
            }
        }).then(res => {
            if (res.data === -1) {
                setSamePage(false);
                getNotifications();
            }
        }).catch(error => {
            setInfoMessage({
                variant: 'danger',
                message: 'Error while deleting the notifications.'
            });

            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    };

    const ClearAllHandler = () => {
        // const nItems = ncardData;
        // const getNotificationIDs = nItems.map((item) => {
        //     return item.notificationID
        // });
        setClearAll(true);
        //setNotificationId(getNotificationIDs);
        setIsdeleteMsg(true);
    }

    const clearAllApi = () => {
        Axios({
            url: serviceUrlHost + '/api/Notifications/ClearNotificationItems',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: {
                "NotificationIds": allNotifiIds
            }
        }).then(res => {
            if (res.data === -1) {
                setncardData([]);
                getNotifications();
            }
        }).catch(error => {
            setInfoMessage({
                variant: 'danger',
                message: 'Error while clearing the notifications.'
            });

            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    useEffect(() => {
        getNotifications();
        const unlisten = history.listen((loc, action) => { // to call when notification bell icon is clicked
            if (loc.pathname == "/notifications") {
                setSamePage(false);
                getNotifications();
            }
        });
        return () => {
            unlisten();
        }
    }, []);

    const getNotifications = () => { // get notifications api
        Axios({
            url: serviceUrlHost + '/api/Notifications/GetNotificationItemsForCMM',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: {
                LoginUserEmail: userEmail
            }
        })
            .then(res => {
                let cardData = [];
                const allIDs = [];

                if (res.data) {
                    cardData = res.data.map((obj) => {
                        allIDs.push(obj.NotificationID);

                        const emailBody = obj.EmailBody;
                        const getContent = emailBody.match(/<\s*p id="Notification"[^>]*>(.*?)<\s*\/\s*p>/) || emailBody.match(/<\s*p id="Notification"[^>]*>([^<]*)<\s*\/\s*p>/);
                        if (getContent && getContent.length > 0) {
                            return {
                                notificationID: obj.NotificationID,
                                isRead: obj.IsRead,
                                date: obj.CreatedDate,
                                type: obj.NotificationStatus,
                                label: getContent[1], // fetch only the filtered content from the email body
                                content: obj.EmailBody,
                                notificationClass: getNClass(obj.NotificationStatus) // change the card color based on the notification status
                            };
                        }
                    });
                }
                setAllNotifiIds(allIDs); // setting in state so it can be passed for clear all api
                setncardData(cardData.reverse());
                getNotificationCount(); // make notifciation count api call to get number of unread notifications
            })
            .catch(error => {
                setInfoMessage({
                    variant: 'danger',
                    message: 'Error while fetching notifications.'
                });

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            });
    }
    const getPaginatedData = (pageNum, cardCount) => { // paginate the notification cards
        const startCard = pageNum === 1 ? 0 : (pageNum - 1) * cardCount; // based on number of records to be shown
        //let endCard = cardCount;
        const endCard = ncardData.length > (startCard + cardCount) ? (startCard + cardCount) : ncardData.length; // since obj starts from position 0
        const fromTo = { 'from': startCard + 1, 'to': endCard };
        setFromToCount(fromTo); // as card length always starts from 0
        setPaginatedData(ncardData.slice(startCard, endCard));
        setActivePage(pageNum);
    };

    useEffect(() => {
        if (ncardData !== null && ncardData.length >= 0) {
            isSamePage ? getPaginatedData(activePage, cardCount) : getPaginatedData(1, cardCount);
        } // whenever the data is changed, we need to show only the paginated data
    }, [ncardData]);

    const getNClass = (status) => { // select card class based on the notification status
        if (['New', 'Pending Brand Rights Verification', 'DownloadAsset', 'AssetModifiedbyCMM', 'AssetModifiedbyBM', 'AddUser', 'UserRoleChange'].indexOf(status) !== -1) {
            return 'success';
        } else if (['Rejection', 'CampaignExpiry', 'InventoryExpiry', 'Contract Expired'].indexOf(status) !== -1) {
            return 'rejected';
        } else if (['Hold', 'Reminder for Pending Approvals', 'Contract Expiring in 2Weeks'].indexOf(status) !== -1) {
            return 'hold';
        } else if (status === 'Available for Reuse') {
            return 'reuse';
        } else {
            return 'defaultN';
        }
    }

    const handleClose = () => { // when notification pop up is closed
        setShow(false);
        setClearAll(false);
    }

    const handleShow = (id, content, isRead) => { // when card is opened, show the email body in pop up
        setEmailContent(content);
        setShow(true);
        if (!isRead) { // only update if the notification is unread notification
            Axios({
                url: serviceUrlHost + '/api/Notifications/UpdateNotificationById',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': true
                },
                data: {
                    "NotificationID": id
                }
            }).then(res => {
                if (res.data === -1) {
                    setSamePage(true);
                    getNotifications();
                }
            }).catch(error => {
                setInfoMessage({
                    variant: 'danger',
                    message: 'Error while updating the notifications.'
                });

                setTimeout(() => {
                    setInfoMessage(null);
                }, 5000);
            });
        }
    }

    const handleok = () => { // common function for clear and delete notification
        setIsdeleteMsg(false);
        clearAll ? clearAllApi() : deleteNotificationAPI();
    };

    const handleCancel = () => setIsdeleteMsg(false);

    return (
        <div className="nf-alert-box">
            <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage}/>
            <div className="box-flex">
                <p className="para-notifications">
                    Notifications
                </p>
                {ncardData && ncardData.length === 0
                    ? ''
                    : <a onClick={ClearAllHandler} className="clear-all">
                        Clear All
                      </a>
                }
            </div>
            <div className="pagination-page">
                {ncardData && ncardData.length > 0 &&
                    <Pagination data={ncardData} itemsCount={ncardData.length} onPageChange={getPaginatedData} cardCount={cardCount}
                        fromToCount={fromToCount} showSamePage={isSamePage} activePageItem={activePage} />
                }
            </div>
            <div className="n-card-styling">
                {ncardData && ncardData.length === 0
                    ? <div className="shadow">
                        <p className="box-radius">
                            <span className="no-notification">
                                <NoNotificationBellIcon /></span>
                        </p>

                        <p className="no-new-notify">
                            No New Notifications</p>
                    </div>
                    : <div>
                        {paginatedData && paginatedData.length > 0 && paginatedData.map((notificationData, index) => (
                            <Notification
                                index={index}
                                notificationClass={notificationData.notificationClass}
                                label={notificationData.label}
                                date={notificationData.date}
                                isRead={notificationData.isRead}
                                onClickHandler={() => onClickDelete(notificationData.notificationID)}
                                type={notificationData.type}
                                showEmailBody={() => handleShow(notificationData.notificationID, notificationData.content, notificationData.isRead)}
                            />
                        ))}
                    </div>
                }
            </div>
            <Modal show={show} onHide={handleClose} dialogClassName="modal-60w">
                <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">Notification content</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NotificationBody emailContent={emailContent} />
                </Modal.Body>
            </Modal>
            <Modal centered show={isdeleteMsg} onHide={handleCancel}>
                <Modal.Body>
                    <div>{clearAll ? 'All the notifications will be deleted' : 'Notification once deleted will no longer be available'}</div>
                    <div className="cancel-ok">
                        <Button variant="secondary" onClick={handleCancel} caption='Cancel' />
                        <Button variant="primary" onClick={handleok} caption='Ok' />
                    </div>
                </Modal.Body>
            </Modal>
        </div >
    );
}

export default Notifications;