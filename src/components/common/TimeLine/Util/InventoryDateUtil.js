export const getDates = (inventoryArray, campaignData, statusFilter, statusSearchParam) => {

    if (!inventoryArray || inventoryArray.length === 0) {
        return [];
    }
    const availableDates = [];
    let holdDates = [];
    let lockedDates = [];
    let balckedOutDates = [];

    let availableStart;
    let availableEnd;
    let availableObject = {};
    let balckoutDateArray = [];
    let holdDateArray = [];
    let lockedDateArray = [];

    let showAvailable = checkStatus(statusFilter, statusSearchParam, 'Available');
    let showHold = checkStatus(statusFilter, statusSearchParam, 'Hold');
    let showLocked = checkStatus(statusFilter, statusSearchParam, 'Locked');
    let showBlackOut = true; //checkBalckOutDateDisplay(campaignData, statusFilter, statusSearchParam);;

    balckoutDateArray.push({
        dates: campaignData !== null ? filterBlackOutDates(campaignData.CampaignStartDate, campaignData.CampaignEndDate, getFormatedDates(inventoryArray[0].InventoryBlackedOutDates))
            : getFormatedDates(inventoryArray[0].InventoryBlackedOutDates),
        inventoryObj: inventoryArray[0], display: showBlackOut
    });

    inventoryArray.forEach((obj, index) => {
        switch (obj.InventoryStatus) {
            case 'Available':
                if (campaignData !== null) {
                    availableStart = new Date(campaignData.CampaignStartDate) > new Date(obj.InventoryAvailabilityStartDate) ?
                        new Date(campaignData.CampaignStartDate) : new Date(obj.InventoryAvailabilityStartDate);
                    availableEnd = new Date(campaignData.CampaignEndDate) < new Date(obj.InventoryAvailabilityEndDate) ?
                        new Date(campaignData.CampaignEndDate) : new Date(obj.InventoryAvailabilityEndDate);
                } else {
                    availableStart = new Date(obj.InventoryAvailabilityStartDate);
                    availableEnd = new Date(obj.InventoryAvailabilityEndDate);
                }
                availableObject = obj;
                if (campaignData !== null || statusFilter) {
                    const locked = getFormatedDates(obj.InventoryLockedDates);
                    if (locked.length > 0) {
                        lockedDateArray.push({ dates: locked, inventoryObj: obj, display: showLocked ? false : showLocked });
                    }
                    const hold = getFormatedDates(obj.InventoryHoldDates);
                    if (hold.length > 0) {
                        holdDateArray.push({ dates: hold, inventoryObj: obj, display: showHold ? false : showHold });
                    }
                }
                break;
            case 'Locked':
                if (statusFilter) {
                    if (campaignData !== null) {
                        availableStart = new Date(campaignData.CampaignStartDate) > new Date(obj.InventoryAvailabilityStartDate) ?
                            new Date(campaignData.CampaignStartDate) : new Date(obj.InventoryAvailabilityStartDate);
                        availableEnd = new Date(campaignData.CampaignEndDate) < new Date(obj.InventoryAvailabilityEndDate) ?
                            new Date(campaignData.CampaignEndDate) : new Date(obj.InventoryAvailabilityEndDate);
                    } else {
                        availableStart = new Date(obj.InventoryAvailabilityStartDate);
                        availableEnd = new Date(obj.InventoryAvailabilityEndDate);
                    }
                }
                const l = getFormatedDates(obj.InventoryLockedDates);
                if (l.length > 0) {
                    lockedDateArray.push({ dates: l, inventoryObj: obj, display: showLocked });
                }
                break;
            case 'Hold':
                if (statusFilter) {
                    if (campaignData !== null) {
                        availableStart = new Date(campaignData.CampaignStartDate) > new Date(obj.InventoryAvailabilityStartDate) ?
                            new Date(campaignData.CampaignStartDate) : new Date(obj.InventoryAvailabilityStartDate);
                        availableEnd = new Date(campaignData.CampaignEndDate) < new Date(obj.InventoryAvailabilityEndDate) ?
                            new Date(campaignData.CampaignEndDate) : new Date(obj.InventoryAvailabilityEndDate);
                    } else {
                        availableStart = new Date(obj.InventoryAvailabilityStartDate);
                        availableEnd = new Date(obj.InventoryAvailabilityEndDate);
                    }
                }
                const h = getFormatedDates(obj.InventoryHoldDates);
                if (h.length > 0) {
                    holdDateArray.push({ dates: h, inventoryObj: obj, display: showHold });
                }
                break;
            default:
                break;
        }
    });

    var loop = new Date(availableStart);
    let loopStart = null;
    let loopEnd = null;
    while (loop <= availableEnd) {
        if (!checkDateRange(balckoutDateArray, loop) &&
            !checkDateRange(holdDateArray, loop) &&
            !checkDateRange(lockedDateArray, loop) && loopStart === null) {
            loopStart = new Date(loop);
        } else if ((checkDateRange(balckoutDateArray, loop) ||
            checkDateRange(holdDateArray, loop) ||
            checkDateRange(lockedDateArray, loop)) && loopStart !== null) {
            loopEnd = new Date(loop.setDate(loop.getDate() - 1));
        }

        if (loopStart !== null && loopEnd !== null) {
            availableDates.push({
                start: loopStart,
                end: loopEnd,
                status: 'Available',
                inventoryObj: availableObject,
                show: showAvailable
            })
            loopStart = null;
            loopEnd = null;
        }

        var newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);

        if (loop.getTime() == availableEnd.getTime() && loopStart !== null && loopEnd === null) {
            loopEnd = new Date(loop);
            availableDates.push({
                start: loopStart,
                end: loopEnd,
                status: 'Available',
                inventoryObj: availableObject,
                show: showAvailable
            })
            loopStart = null;
            loopEnd = null;
            break;
        } else if (loop.getTime() > availableEnd.getTime() && loopStart !== null && loopEnd === null) {
            availableDates.push({
                start: loopStart,
                end: loopStart,
                status: 'Available',
                inventoryObj: availableObject,
                show: showAvailable
            })
            loopStart = null;
            loopEnd = null;
            break;
        }

    }

    holdDates = getStatusDate(holdDateArray, 'Hold');
    lockedDates = getStatusDate(lockedDateArray, 'Locked');
    balckedOutDates = getStatusDate(balckoutDateArray, 'BlackedOut');

    // console.log('availableDates', availableDates);
    // console.log('holdDates', holdDates);
    // console.log('lockedDates', lockedDates);
    // console.log('balckedOutDates', balckedOutDates);

    return {
        'Available': availableDates,
        'Hold': holdDates,
        'Locked': lockedDates,
        'BlackedOut': balckedOutDates,
    }
}

const checkDateRange = (range, date) => {
    let rtn = false;
    for (let k = 0; k < range.length; k++) {
        for (let i = 0; i < range[k].dates.length; i++) {
            if (range[k].dates[i].length === 0) {
                continue;
            }
            const start = range[k].dates[i][0];
            const end = range[k].dates[i][1];
            rtn = date <= new Date(end) && date >= new Date(start);
            if (rtn) {
                return rtn;
            }
        }
    }
    return rtn;
}

const getFormatedDates = (dates) => {
    const rtnArr = [];
    if (!dates) {
        return [];
    } else {
        const dateArray = dates.split(';');
        dateArray.forEach((obj, i) => {
            const temp = obj.split(':');
            rtnArr.push(temp)
        });
    }
    return rtnArr;
}

const getStatusDate = (dates, status) => {
    const rtnArr = [];
    if (!dates) {
        return [];
    } else {
        for (let k = 0; k < dates.length; k++) {
            dates[k].dates.forEach((obj, i) => {
                rtnArr.push({
                    start: new Date(obj[0]),
                    end: new Date(obj[1]),
                    status: status,
                    inventoryObj: dates[k].inventoryObj,
                    show: dates[k].display
                })
            });
        }

    }

    return rtnArr;
}

const checkBalckOutDateDisplay = (campaignData, statusFilter, statusArray) => {
    if (campaignData !== null) {
        return false;
    } else {
        return (statusArray.length === 0 || statusArray.includes('All')) ? true : !statusFilter;
    }
}

const checkStatus = (statusFlag, statusArray, status) => {
    if (!statusFlag || statusArray.length === 0) {
        return true;
    } else {
        return statusArray.includes('All') ? true : statusArray.includes(status);
    }
}

const filterBlackOutDates = (campaignStart, campaignEnd, dates) => {
    return dates.filter((obj) => {
        if (new Date(obj[0]) >= new Date(campaignStart)
            || new Date(obj[1]) <= new Date(campaignEnd)) {
            obj[0] = new Date(obj[0]) >= new Date(campaignStart) ? obj[0] : campaignStart;
            obj[1] = new Date(obj[1]) <= new Date(campaignEnd) ? obj[1] : campaignEnd;
            return obj;
        }
    })
}
