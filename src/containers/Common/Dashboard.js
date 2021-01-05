import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    PrimaryDropdown, LineChart, DonutChart, CalendarChart,
    BarChart, MultiDropdown, LineChartCampaign, AlertBox
} from '../../components/common';
import * as d3 from "d3";
import './Dashboard.css';
import { serviceUrlHost } from '../../utils/apiUrls';
import Axios from 'axios';
import filterIcon from '../../styles/images/filter.png';

const qurterOptions = [
    { ID: 'Q1', Name: 'Q1' },
    { ID: 'Q2', Name: 'Q2' },
    { ID: 'Q3', Name: 'Q3' },
    { ID: 'Q4', Name: 'Q4' },
    { ID: 'All', Name: 'All' }
];

export default () => {
    const [venueTypeDonutData, setVenueTypeDonutData] = useState([]);
    const [mediaChannelDonutData, setMediaChannelDonutData] = useState([]);
    const [mediaBoxData, setMediaBoxData] = useState([]);
    const [unUsedInvntData, setUnUsedInvntData] = useState([]);
    const [inventoryStatusData, setInventoryStatusData] = useState([]);
    const [campaignNameList, setCampaignNameList] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [campMediaChannelDonutData, setCampMediaChannelDonutData] = useState([]);
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalAssetsByMediaChannel, setTotalAssetsByMediaChannel] = useState([]);
    const [totalNumberOfCampaign, setTotalNumberOfCampaign] = useState(0);
    const [totalNumberInventories, setTotalNumberInventories] = useState(0);
    const [filterOptions, setFilterOptions] = useState(qurterOptions);
    const [filterValue, setFilterValue] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [loading, setLoading] = useState(false);
    const [infoMessage, setInfoMessage] = useState(null);
    const [barChartPeriodData, setBarChartPeriodData] = useState([]);
    const [isQuarter, setIsQuarter] = useState(true);

    const getWindowWidth = () => {
        const DeviceWidth = window.outerWidth;
        return DeviceWidth;
    }
    const [windowWidth, setWindowWidth] = useState(getWindowWidth());

    const venueTypeColors = [
        { Color: "#d5eef5", Name: "Airplane" },
        { Color: "#ff99ff", Name: "Airport" },
        { Color: "#fdfad1", Name: "Amusement Park" },
        { Color: "#9696ca", Name: "Arena/Stadium" },
        { Color: "#c9e32b", Name: "Bar/Nightclub" },
        { Color: "#f69ac3", Name: "Campus/College/University" },
        { Color: "#3463aa", Name: "Casino" },
        { Color: "#d0cbe9", Name: "Cinema/Movie Theatre" },
        { Color: "#bb509e", Name: "Convenience Store" },
        { Color: "#ed9017", Name: "Email" },
        { Color: "#6dcddd", Name: "Gas Station/Car Wash" },
        { Color: "#7d9bbe", Name: "Golf Courses and Facilities" },
        { Color: "#979797", Name: "Grocery" },
        { Color: "#faa94f", Name: "Gym/Fitness Centers" },
        { Color: "#fecc99", Name: "Hospital" },
        { Color: "#faf49c", Name: "Hotel/ Resort" },
        { Color: "#108380", Name: "Mall/Shopping Center" },
        { Color: "#f56623", Name: "Museum/Exhibition Hall" },
        { Color: "#ffffff", Name: "Office Building" },
        { Color: "#989797", Name: "Official Building" },
        { Color: "#d2e7c6", Name: "Racetrack" },
        { Color: "#b58ce7", Name: "Resort" },
        { Color: "#a45a2b", Name: "Restaurant" },
        { Color: "#b8e2db", Name: "Retail/Specialty Store" },
        { Color: "#39f3bb", Name: "Ski Area" },
        { Color: "#ffe6ff", Name: "Sporting Courts/Fields" },
        { Color: "#f67f83", Name: "Train Station" },
        { Color: "#983264", Name: "Zoo/Aquarium" },
        { Color: "#ccfeff", Name: "Other" },
        { Color: "#95f895", Name: "Concert Hall" }
    ];

    const mediaChannelColors = [
        { Color: "#f7da87", Name: "Audio Broadcast" },
        { Color: "#63bda0", Name: "Audio Recording" },
        { Color: "#3184b8", Name: "Digital Display" },
        { Color: "#f8acbc", Name: "Digital Social" },
        { Color: "#e0ee94", Name: "Digital Video" },
        { Color: "#97caee", Name: "Out of Home" },
        { Color: "#f08100", Name: "Print Ad" },
        { Color: "#a6d79f", Name: "Print Magazine" },
        { Color: "#e8c524", Name: "Print Newspaper" },
        { Color: "#f8c99c", Name: "Television Broadcast" },
        { Color: "#bbf888", Name: "Television In-Room" },
        { Color: "#6eddf8", Name: "Video (Non-Digital)" },
        { Color: "#b378f5", Name: "Other" }
    ]



    const getCampaignDropDown = () => {
        setLoading(true);
        Axios({
            url: serviceUrlHost + '/api/Campaign/CampaignDropdown ',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        }).then(res => {
            if (res && res.data && res.data.CampaignData) {
                const campaignData = res.data.CampaignData;
                const dropdownData = campaignData.map((obj) => ({
                    ID: obj.CampaignID,
                    Name: obj.CampaignName,
                }));
                setCampaignNameList(dropdownData);
            }
        }).catch(error => {
            console.log('error fetching campaign dropdown', error);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while fetching campaign dropdown.'
            });
        
            setLoading(false);
            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    const getCampaignData = () => {
        Axios({
            url: serviceUrlHost + '/api/Dashboard/Campaign',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: {
                "CampaignID": selectedCampaignId === '' ? null : selectedCampaignId,
                "Quarter": (filterValue.length === 0 || filterValue.includes('All')) ? null : filterValue.join(',')
            }
        }).then((response) => {
            if (response && response.data && response.data[0]) {
                if (response.data[0].MediaChannel) {
                    const campMediaChannel = response.data[0].MediaChannel.map((o, i) => {
                        const obj = mediaChannelColors.find(d => d.Name === o.Name);
                        return { label: o.Name, value: o.Value, color: obj ? obj.Color : '#a9a9a9' }
                    })
                    setCampMediaChannelDonutData(campMediaChannel);
                }
                if (response.data[0].QWorth) {
                    setBarChartData(response.data[0].QWorth);
                }
                if (response.data[0].PWorth) {
                    setBarChartPeriodData(response.data[0].PWorth);
                }
                if (response.data[0].TotalAssets !== undefined) {
                    setTotalAssets(response.data[0].TotalAssets);
                }
                if (response.data[0].TotalAssetsByMediaChannel) {
                    const totalAssetsByMediaChannel = response.data[0].TotalAssetsByMediaChannel.map((o, i) => {
                        const obj = mediaChannelColors.find(d => d.Name === o.Name);
                        return {
                            name: o.Name,
                            value: o.Value,
                            color: obj ? obj.Color : '#a9a9a9'
                        }
                    })
                    setTotalAssetsByMediaChannel(totalAssetsByMediaChannel);
                }
                if (response.data[0].TotalCampaigns !== undefined) {
                    setTotalNumberOfCampaign(response.data[0].TotalCampaigns);
                }
            }
            setLoading(false);
        }).catch((error) => {
            console.log(error);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while fetching campaign Data.'
            });

            setLoading(false);
            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    const getDashboardInventoryData = () => {

        Axios({
            url: serviceUrlHost + '/api/Dashboard/Inventory',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            }
        }).then((response) => {

            if (response && response.data && response.data[0]) {
                if (response.data[0].VenueType) {
                    const venueData = response.data[0].VenueType.map((o, i) => {
                        const obj = venueTypeColors.find(d => d.Name === o.Name);
                        return { label: o.Name, value: o.Value, color: obj ? obj.Color : '#a9a9a9' }
                    })
                    setVenueTypeDonutData(venueData);
                }
                if (response.data[0].MediaChannel) {
                    const mediaData = response.data[0].MediaChannel.map((o, i) => {
                        const obj = mediaChannelColors.find(d => d.Name === o.Name);
                        return { label: o.Name, value: o.Value, color: obj ? obj.Color : '#a9a9a9' }
                    })
                    setMediaChannelDonutData(mediaData);
                }
                if (response.data[0].NewInventories) {
                    const mediaBoxData = response.data[0].NewInventories.map((o, i) => {
                        const obj = mediaChannelColors.find(d => d.Name === o.Name);
                        return { label: o.Name, value: o.Value, align: 'center', color: obj ? obj.Color : '#a9a9a9' }
                    })
                    setMediaBoxData(mediaBoxData);
                }
                if (response.data[0].UnusedInventory) {
                    const unUsedInvntData = [{
                        name: 'of inventory is unused',
                        value: response.data[0].UnusedInventory,
                        color: '#ce032a',
                        align: 'left'
                    }];
                    setUnUsedInvntData(unUsedInvntData);
                }
                if (response.data[0].InventoryStatus) {
                    const inventoryStatusData = response.data[0].InventoryStatus.map((o, i) => {
                        return {
                            name: o.Name,
                            value: o.Value,
                            color: o.Name === 'Available' ? '#008240' : (o.Name === 'Hold' ? '#d8af04' : '#ce032a')
                        }
                    })
                    setInventoryStatusData(inventoryStatusData);
                }
                if (response.data[0].TotalNumberInventories !== undefined) {
                    setTotalNumberInventories(response.data[0].TotalNumberInventories);
                }
            }

        }).catch((error) => {
            console.log(error);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while fetching Inventory Data.'
            });
        
            setLoading(false);
            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
        });
    }

    const [filterById, setFilterById] = useState(0);

    const handleFilterBy = (value) => {
        if (value.includes('All')) {
            setFilterValue(['All']);
            filterOptions.map((item) => {
                const isDisabled = item.ID !== 'All' ? true : false;
                item.disabled = isDisabled;
                return item;
            });
        } else {
            setFilterValue(value);
            filterOptions.map((item) => {
                item.disabled = false;
                return item;
            });
        }
    };

    const handleCampaignChange = (e) => {
        setSelectedCampaignId(e.target.value);
    };

    const handleWorthChange = (e) => {
        setIsQuarter(e.target.value === 'quarter')
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
        getDashboardInventoryData();
        getCampaignDropDown();
        getCampaignData();

        setFilterValue(['All']);
        filterOptions.map((item) => {
            const isDisabled = item.ID !== 'All' ? true : false;
            item.disabled = isDisabled;
            return item;
        });
    }, []);

    useEffect(() => {
        getCampaignData();
    }, [filterValue, selectedCampaignId]);

    return (
        <React.Fragment>
            <Card.Title className="Title-Mobile sticky-top" id="myHeader">Dashboard</Card.Title>
            <div>
                <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} />
                {loading && <div className='dashboard-loading-container'>
                    <Spinner animation="border" variant="primary" />
                </div>}
                <div className="dashBoardWrapper">
                    <Row className="Margin0 totalNumberInventories">
                        <div><p className="heading_Dashboard">INVENTORY</p></div>
                        <div className="total_Inventories">
                            <p className="label_Dashboard" >Total Number of Inventory</p>
                            <div className="digit_Dashboard">{totalNumberInventories}</div>
                        </div>
                    </Row>
                    <div className="d-block d-sm-none">
                        <div className="Margin0">
                            {unUsedInvntData.length !== 0 &&
                                <LineChart inputData={unUsedInvntData} title="Unused Inventory" isPercentage={true} />
                            }
                            {inventoryStatusData.length !== 0 &&
                                <LineChart inputData={inventoryStatusData} title="Status" isPercentage={true} />
                            }
                        </div>
                    </div>
                    <Row className="Margin0">
                        <Col md={12} xs={12} className="subTitle">
                            <div className="donutTitle">Venue type</div>
                            <Col className="Padding0 d-block d-sm-none">
                                {venueTypeDonutData.length !== 0
                                    ? <DonutChart
                                        data={venueTypeDonutData}
                                        innerRadius={55}
                                        outerRadius={100}
                                        id="venueType_mobile"

                                    />
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>
                            <Col className="Padding0 d-none d-sm-block">
                                {venueTypeDonutData.length !== 0
                                    ? <DonutChart
                                        data={venueTypeDonutData}
                                        innerRadius={95}
                                        outerRadius={180}
                                        id="venueType"

                                    />
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>
                        </Col>
                        <Col md={12} xs={12} className="subTitle">
                            <div className="donutTitle">Media Channel</div>

                            <Col className="Padding0 d-block d-sm-none">
                                {mediaChannelDonutData.length !== 0
                                    ? <DonutChart
                                        data={mediaChannelDonutData}
                                        innerRadius={55}
                                        outerRadius={100}
                                        id="mediaChannel_mobile"
                                    />
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>

                            <Col className="Padding0 d-none d-sm-block">
                                {mediaChannelDonutData.length !== 0
                                    ? <DonutChart
                                        data={mediaChannelDonutData}
                                        innerRadius={95}
                                        outerRadius={180}
                                        id="mediaChannel"
                                    />
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>
                        </Col>
                    </Row>

                    <div className="Margin0 d-none d-sm-block">
                        {unUsedInvntData.length !== 0 &&
                            <LineChart inputData={unUsedInvntData} title="Unused Inventory" isPercentage={true} />
                        }
                        {inventoryStatusData.length !== 0 &&
                            <LineChart inputData={inventoryStatusData} title="Status" isPercentage={true} />
                        }
                    </div>

                    {mediaBoxData.length !== 0 &&
                        <Row className="Margin0">
                            <Col xs={12} className="subTitle dashboard-new-inventories">New Inventory</Col>
                            <Col xs={12} className="Padding0 dashboard-mediaBoxData">
                                {mediaBoxData.length !== 0 &&
                                    <CalendarChart input={mediaBoxData} />
                                }
                            </Col>
                        </Row>
                    }
                </div>
                <div className="dashBoardWrapper">
                    <Row className="totalNumberInventories">
                        <div><p className="heading_Dashboard">CAMPAIGNS</p></div>
                        <div className="total_Inventories">
                            <p className="label_Dashboard" >Total Number of Campaigns</p>
                            <div className="digit_Dashboard">{totalNumberOfCampaign}</div>
                        </div>
                    </Row>
                    <Row className="SearchCampaign">
                        <Col xs={10} md={4}>
                            <PrimaryDropdown
                                value={filterById}
                                label=""
                                placeholder="Search Campaign"
                                searchOptionRequired={true}
                                options={campaignNameList}
                                onChange={e => handleCampaignChange(e)}
                            />
                        </Col>

                        <Col md={8} xs={2}>
                            <div className="DashboardQuarter dashboard-filter">
                                <img className="filterImage" src={filterIcon}></img>
                                <MultiDropdown
                                    label=''
                                    value={filterValue}
                                    onChange={e => handleFilterBy(e)}
                                    options={filterOptions}
                                    placeholder=' '
                                    searchOptionRequired={true}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row className="Margin0">
                        <Col md={12} xs={12} className="Padding0 subTitle ">
                            <div className="donutTitle">Media Channel</div>
                            <Col className="Padding0  d-block d-sm-none">
                                {campMediaChannelDonutData.length !== 0
                                    ? <DonutChart
                                        data={campMediaChannelDonutData}
                                        innerRadius={55}
                                        outerRadius={100}
                                        id="campMediaChannel"
                                    />
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>
                            <Col className="Padding0 d-none d-sm-block">
                                {campMediaChannelDonutData.length !== 0
                                    ? <DonutChart
                                        data={campMediaChannelDonutData}
                                        innerRadius={95}
                                        outerRadius={180}
                                        id="campMediaChannel_mobile"
                                    />
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>

                        </Col>
                        <Col md={12} xs={12} className="Padding0 subTitle">
                            {/* style={{ textAlign: "center" }}> */}
                            <div className="donutTitle">Net Worth</div>
                            <Col className="Padding0 bar-chart-ipad padding-center">
                                {barChartData.length !== 0
                                    ? <div>
                                        <div className="worth-radio-container">
                                            <span className="worth-radio-span">
                                                <label className="worth-radio-inline"><input type="radio" value="quarter" name="option" defaultChecked onChange={handleWorthChange} />Quarter</label>
                                            </span>
                                            <span className="worth-radio-span">
                                                <label className="worth-radio-inline"><input type="radio" value="period" name="option" onChange={handleWorthChange} />Period</label>
                                            </span>
                                        </div>
                                        <div className="d-block d-sm-none">
                                            <BarChart id="barchart" data={isQuarter ? barChartData : barChartPeriodData} width={290} height={193} xlabel={isQuarter ? 'Quarter' : 'Period'} />
                                        </div>
                                        <div className="d-none d-sm-block">
                                            <BarChart id="barchart" data={isQuarter ? barChartData : barChartPeriodData} width={(windowWidth >= 768 && windowWidth <= 1024) ? 340 : 500} height={(windowWidth >= 768 && windowWidth <= 1024) ? 250 : 350} xlabel={isQuarter ? 'Quarter' : 'Period'} />
                                        </div>
                                    </div>
                                    : <p className={"no-data"}>No Data found</p>
                                }
                            </Col>
                        </Col>
                    </Row>
                    <Row className="Margin0">
                        <Col xs={11} className="Padding0">
                            <LineChartCampaign inputData={totalAssetsByMediaChannel} title="Total Number of Assets" totalAssets={totalAssets} />
                        </Col>
                        <Col xs={1} className="Padding0 d-none d-sm-block">
                            <div className="digit_Asset">{totalAssets}</div>
                        </Col>
                    </Row>
                </div>
            </div >
        </React.Fragment>
    )
}