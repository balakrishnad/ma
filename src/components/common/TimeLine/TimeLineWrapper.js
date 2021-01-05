import React, { useState, useEffect } from 'react';
import TimeLine from './TimeLine';


/*
 Time Line Wrapper: Props are manipulated to draw the time line chart
  Props: 
    inventoryData -> Inventory Card Data
    inventoryCardProps -> Inventory Card display condition props
    campaignData -> Used for Available Inventory Timeline,  for Browse Inventory it will be null
    statusFilter -> Is Status filter appiled (true/false)
    statusSearchParam -> Value of status filter when statusFilter:true
    filterYear -> Not yet used 
    filterQuarter -> Not yest used
*/
export default (props) => {

    const {
        inventoryData,
        inventoryCardProps,
        campaignData = null,
        statusFilter = false,
        statusSearchParam = [],
        filterYear = null,
        filterQuarter = 'Q3'
    } = props;

    const NUMBER_OF_WEEKS_FOR_PERIOD = 4;

    const defaultTimeLine = [];

    /* Returns unique media channal array for given inventory data */
    const getUniqueMediaChannel = (invData) => {
        const unique = [...new Set(invData.map(item => item.MediaChannel))];
        return unique;
    }

    /* Returns unique media inventory ID array for given inventory data */
    const getUniqueMediaInventory = (inventory) => {
        const unique = [...new Set(inventory.map(item => item.MediaInventoryId))];
        return unique;
    }

    /* Returns unique media start date array for given inventory data */
    const getUniqueInvStartDate = (obj) => {
        const unique = [...new Set(obj.map(item => new Date(item.InventoryAvailabilityStartDate)))];
        return unique;
    }

    /* Returns unique media end date array for given inventory data */
    const getUniqueInvEndDate = (obj) => {
        const unique = [...new Set(obj.map(item => new Date(item.InventoryAvailabilityEndDate)))];
        return unique;
    }

    const getMinStartDate = () => {
        return new Date(Math.min.apply(null, Array.from(getUniqueInvStartDate(inventoryData))));
    }

    const getMaxEndDate = () => {
        return new Date(Math.max.apply(null, Array.from(getUniqueInvEndDate(inventoryData))));
    }

    const getInventoryBasedonMediaChannel = (param, data) => {
        return data.filter((obj, i) => {
            return obj.MediaChannel === param
        })
    }

    const getInventoryBasedonId = (param, data) => {
        return data.filter((obj, i) => {
            return obj.MediaInventoryId === param
        })
    }

    /* Returns inventory data grouped by Media Channels
        return : [
            {
                id: <Unique Id>
                name: <Media Channel name>
                elements: <Inventories for the Media Channel>
                collapse: <true/false: Falg if media channal should be expanded or collapsed in timeline view>
            },
            ...
        ]
    */
    const getMeidaChannal = (invData) => {
        let inventories = [];
        return Array.from(getUniqueMediaChannel(invData)).map((mc, i) => {
            inventories = [];
            const invId = getUniqueMediaInventory(getInventoryBasedonMediaChannel(mc, invData));
            Array.from(invId).forEach((id, i) => {
                inventories.push(getInventoryBasedonId(id, invData));
            });
            return {
                id: i,
                name: mc === null ? 'No Media Channel' : mc,
                elements: inventories,
                collapse: collapsedMediaChannels.includes(mc === null ? 'No Media Channel' : mc) ? true : false
            }
        }).sort((a, b) => {
            let c = 0;
            if (a.name > b.name) {
                c = 1;
            } else if (a.name < b.name) {
                c = -1;
            }
            return c;
        });
    }

    const checkDateInRange = (start, end, date) => {
        return date <= end && date >= start;
    }

    /*
        Filters the inventory data based on given start date and end date
    */
    const filterInventoryData = (startDate, endDate) => {
        let filteredInventoryData = inventoryData.filter((obj) => {
            const inventoryStartDate = new Date(obj.InventoryAvailabilityStartDate);
            const inventoryEndDate = new Date(obj.InventoryAvailabilityEndDate);
            if ((inventoryStartDate >= startDate && inventoryStartDate <= endDate) ||
                (inventoryEndDate >= startDate && inventoryEndDate <= endDate)) {
                // obj.InventoryAvailabilityStartDate = inventoryStartDate < startDate ?
                //     startDate : obj.InventoryAvailabilityStartDate;
                // obj.InventoryAvailabilityEndDate = inventoryEndDate > endDate ?
                //     endDate : obj.InventoryAvailabilityEndDate;
                return obj;
            }
        })
        return filteredInventoryData;
    }

    const collapseMediaChannel = (name, flag) => {
        if (flag) {
            let newOpts = [...collapsedMediaChannels];
            newOpts.splice(newOpts.indexOf(name), 1)
            setCollapsedMediaChannels(newOpts);
        } else {
            setCollapsedMediaChannels([...collapsedMediaChannels, name]);
        }

    }

    const [timeBar, setTimeBar] = useState([]);
    const [yearTimeBar, setYearTimeBar] = useState([]);
    const [sideBar, setSideBar] = useState([]);
    const [collapsedMediaChannels, setCollapsedMediaChannels] = useState([]);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [timeLine, setTimeLine] = useState(defaultTimeLine);
    const [noData, setNoData] = useState(false);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (inventoryData.length > 0) {
            const s = campaignData == null ? getMinStartDate() : new Date(campaignData.CampaignStartDate);
            const e = campaignData == null ? getMaxEndDate() : new Date(campaignData.CampaignEndDate);

            const date = new Date(`${s.getFullYear()}`);
            const day = date.getDay();

            // Finding last Saturday of the Year
            if (day !== 6) {
                date.setDate(date.getDate() - (day + 1));
            }

            let week = NUMBER_OF_WEEKS_FOR_PERIOD;
            let count = 1;
            let periodStarts = false;
            const periodArray = [];
            const periodYearArray = [];
            let yearStart;
            let yearEnd;

            /*
                 Create periods based on the start and end date
                 Each Period object format : {
                     year: <Year In which the period belongs
                     start: <Period Start Date>
                     end: <Period End Date>
                 }
             */
            for (let period = 1; period <= 13; period++) {
                const startDate = new Date(date.getTime() + 86400000);
                if (date > e) {
                    if(!yearEnd) {
                        yearEnd = new Date(endDate);
                        periodYearArray.push({
                            year: endDate.getFullYear(),
                            start: yearStart,
                            end: yearEnd
                        })
                    } else if (endDate > yearEnd) {
                        const temp = new Date(yearEnd);
                        yearStart = new Date(temp.setDate(temp.getDate() + 1));
                        yearEnd = new Date(endDate);
                        periodYearArray.push({
                            year: endDate.getFullYear(),
                            start: yearStart,
                            end: yearEnd
                        })
                    }
                    break;
                }
                const endDate = new Date(date.setDate(date.getDate() + (week * 7)));

                if (!periodStarts) {
                    periodStarts = checkDateInRange(startDate, endDate, s);
                    if (periodStarts) {
                        yearStart = new Date(startDate);
                    }
                }

                if (!periodStarts) {
                    continue;
                }

                const p = {
                    id: count,
                    periodName: 'P' + period,
                    startDate: startDate,
                    endDate: endDate
                }
                periodArray.push(p);
                if (period === 1) {
                    yearStart = yearStart === undefined ? new Date(yearEnd) : new Date(startDate);
                }
                if (period === 13) {
                    period = 0;
                    yearEnd = new Date(endDate);
                    periodYearArray.push({
                        year: endDate.getFullYear(),
                        start: yearStart,
                        end: yearEnd
                    })
                }
                count++;
            }
            /*
                Setting the timeline object
                format: [
                    {
                        year: <year object>
                        quarterPeriods: <Quarter for respected year>
                        periods: <Periods for respected year>
                    }
                ]
            */
            setTimeLine(periodYearArray.map((yearObj) => {
                // Create quarters based on the period array
                const y = yearObj.year;
                const periodsPerYear = periodArray.filter((period) => {
                    return period.endDate.getFullYear() === y;
                });
                const qp = [
                    {
                        quarter: 'Q1',
                        periods: periodsPerYear.filter((obj) => {
                            if (obj.periodName === 'P1' ||
                                obj.periodName === 'P2' ||
                                obj.periodName === 'P3') {
                                return obj;
                            }
                        })
                    },
                    {
                        quarter: 'Q2',
                        periods: periodsPerYear.filter((obj) => {
                            if (obj.periodName === 'P4' ||
                                obj.periodName === 'P5' ||
                                obj.periodName === 'P6') {
                                return obj;
                            }
                        })
                    },
                    {
                        quarter: 'Q3',
                        periods: periodsPerYear.filter((obj) => {
                            if (obj.periodName === 'P7' ||
                                obj.periodName === 'P8' ||
                                obj.periodName === 'P9') {
                                return obj;
                            }
                        })
                    },
                    {
                        quarter: 'Q4',
                        periods: periodsPerYear.filter((obj) => {
                            if (obj.periodName === 'P10' ||
                                obj.periodName === 'P11' ||
                                obj.periodName === 'P12' ||
                                obj.periodName === 'P13') {
                                return obj;
                            }
                        })
                    }
                ];
                return {
                    year: yearObj,
                    quarterPeriods: qp,
                    periods: periodsPerYear
                }
            }));
        }
    }, [inventoryData]);

    useEffect(() => {
        try {
            let data = [];
            if (timeLine.length > 0) {
                let yearData = [];
                let periodData = [];
                if (filterYear) {
                    timeLine.forEach((obj) => {
                        if (filterYear === obj.year.year) {
                            const quarter = obj.quarterPeriods.find(o => o.quarter === filterQuarter);
                            periodData = quarter.periods;
                            let yearObj = { ...obj.year };
                            yearObj.start = periodData[0].startDate;
                            yearObj.end = periodData[periodData.length - 1].endDate;
                            yearData.push(yearObj);
                            setZoom(1);
                            data = filterInventoryData(periodData[0].startDate, periodData[periodData.length - 1].endDate);
                        }
                    });
                } else {
                    timeLine.forEach((obj) => {
                        yearData.push(obj.year);
                        periodData.push(...obj.periods);
                    });
                    data = inventoryData;
                    setZoom(periodData.length < 9 ? 1 : 6.5);
                }
                setTimeBar(periodData);
                setYearTimeBar(yearData);
                setStart(periodData[0].startDate)
                setEnd(periodData[periodData.length - 1].endDate);
                setSideBar(getMeidaChannal(data));
            }
        } catch {
            setNoData(true);
        }
    }, [timeLine, filterQuarter, filterYear, collapsedMediaChannels])

    return (
        <div>
            {(inventoryData.length > 0 && !noData) && <TimeLine
                inventoryCardProps={inventoryCardProps}
                statusSearchParam={statusSearchParam}
                statusFilter={statusFilter}
                campaignData={campaignData}
                yearTimeBar={yearTimeBar}
                timeBar={timeBar}
                sideBar={sideBar}
                start={start}
                end={end}
                zoom={zoom}
                collapseEvent={collapseMediaChannel}>
            </TimeLine>}
            {(inventoryData.length === 0 || noData) && <div className="tl-no-results">No inventory found</div>}
        </div>
    )
}