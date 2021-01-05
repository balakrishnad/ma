import React, { useState, useEffect, useRef } from 'react';
import './CreateCampaign.css';
import { TextField, MultiDropdown, CalendarIcon, Button, RemoveIcon, TickIconBlack, AlertBox } from '../../components/common';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import useOnClickOutside from '../../components/common/OutsideHandler';
import { Overlay, Popover, Card, Row, Col } from 'react-bootstrap';
import DatePicker from '../../components/common/DatePicker.js';
import AutoCompleteTextBox from '../../components/common/AutoCompleteTextBox';
import { getUserEmail } from '../../utils/userRolehelper';
import { serviceUrlHost } from '../../utils/apiUrls';

const userEmail = getUserEmail();
const createCampaignDefaultObj = {
    CampaignName: '',
    CampaignStartDate: '',
    CampaignEndDate: '',
    CampaignNotes: '',
    PreferredCampaignBrands: [],
    CampaignContact: '',
    ContactEmailID: '',
    CampaignStatus: 'Active',
    CreatedBy: userEmail,
    ModifiedBy: userEmail,
    CreatedDate: '',
    Modified: '',
    IsActive: 1
}

const savedCampaign = [];

const CreateCampaign = () => {
    const [infoMessage, setInfoMessage] = useState(null);
    const [dropdownOptions, setDropdownOptions] = useState({});
    const { Brand } = dropdownOptions;
    const [createCampaignvalues, setCreateCampaignValues] = useState({
        CampaignName: '',
        CampaignStartDate: '',
        CampaignEndDate: '',
        CampaignNotes: '',
        PreferredCampaignBrands: [],
        CampaignContact: '',
        ContactEmailID: '',
        CampaignStatus: 'Active',
        CreatedBy: userEmail,
        ModifiedBy: userEmail,
        CreatedDate: '',
        Modified: '',
        IsActive: 1
    });

    let defaultCampaignDateValue = '';
    const [campaignDateValue, setCampaignDateValue] = useState(defaultCampaignDateValue);
    const [showCampaignDate, setShowCampaignDate] = useState(false);
    const [campaignDatetarget, setCampaignDatetarget] = useState(null);
    const campaignDateRef = useRef();
    const [fromCampaignDate, setFromCampaignDate] = useState(undefined);
    const [toCampaignDate, setToCampaignDate] = useState(undefined);
    const [fromToTextCampaignDate, setFromToTextCampaignDate] = useState(undefined);
    const campaignDateOverLay = useRef();

    const searchUserApi = serviceUrlHost + '/api/User/SearchUsers/';

    const handleClickCampaignDate = event => {
        setShowCampaignDate(!showCampaignDate);
        setCampaignDatetarget(event.target);
    };

    const campaignDateCallBack = ({ range }) => {

        if (range.from == null || range.to == null) {
            setFromToTextCampaignDate(undefined);
            setFromCampaignDate(undefined);
            setToCampaignDate(undefined);
            setCampaignDateValue(defaultCampaignDateValue);
        } else {
            let from = new Date(range.from);
            let to = new Date(range.to);
            setFromCampaignDate(range.from);
            setToCampaignDate(range.to);

            let fromday = from.getDate();
            let frommonth = from.getMonth();
            let fromyear = from.getFullYear();

            let today = to.getDate();
            let tomonth = to.getMonth();
            let toyear = to.getFullYear();

            let rangeVal = (frommonth + 1) + '/' + fromday + '/' + fromyear + ' - ' + (tomonth + 1) + '/' + today + '/' + toyear;

            if (rangeVal !== '') {
                setFromToTextCampaignDate(rangeVal);
            } else {
                setFromToTextCampaignDate(undefined);
            }
        }

        setShowCampaignDate(!showCampaignDate);
    }

    useEffect(() => {
        if (fromToTextCampaignDate) {
            setCampaignDateValue(fromToTextCampaignDate);
            let from = new Date(fromCampaignDate);
            let to = new Date(toCampaignDate);
            let fromMonth = from.getMonth() + 1;
            let toMonth = to.getMonth() + 1;
            setCreateCampaignValues({
                ...createCampaignvalues,
                CampaignStartDate: from.getFullYear() + '-' + fromMonth + '-' + from.getDate(),
                CampaignEndDate: to.getFullYear() + '-' + toMonth + '-' + to.getDate()
            });
        }
    }, [fromToTextCampaignDate]);

    useOnClickOutside(campaignDateOverLay, () => setShowCampaignDate(false));

    const saveCamapign = () => {
        Axios({
            url: serviceUrlHost + '/api/Campaign/AddCampaign',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
            data: {
                ...createCampaignvalues,
                CreatedBy: userEmail,
                CreatedDate: new Date(),
                ModifiedBy: userEmail,
                ModifiedDate: new Date(),
            }
        }).then((response) => {
            setInfoMessage({
                variant: 'success',
                message: 'Campaign has been created.',
                icon: TickIconBlack
            });
            setTimeout(() => {
                setInfoMessage(null);
            }, 5000);
            setCreateCampaignValues(createCampaignDefaultObj);
            resetFields();
        }).catch((error) => {
            console.log(error);
            setInfoMessage({
                variant: 'danger',
                message: 'Error occured while Saving...'
            });
        });
    };

    const handleChange = (e, type) => {
        const camp = { ...createCampaignvalues };
        let value = e.target.value;

        camp[type] = value;
        setCreateCampaignValues(camp);
    };

    useEffect(() => {
        Axios({
            url: serviceUrlHost + '/api/Inventory/GetInventoryFormDropDownValues', // Dev instance
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

    const resetFields = () => {
        setCampaignDateValue(defaultCampaignDateValue);
        setFromToTextCampaignDate(undefined);
        setFromCampaignDate(undefined);
        setToCampaignDate(undefined);
    };

    const handleMultiChange = (value, type) => {
        const PreferredBrands = [];
        value.map((val, i) => {
            let obj = {
                BrandIds: val
            }
            PreferredBrands.push(obj);
        });

        setCreateCampaignValues({
            ...createCampaignvalues,
            PreferredCampaignBrands: PreferredBrands,
        });
    };

    const verifyCreateCampaign = () => {
        if (createCampaignvalues.CampaignName === "" || campaignDateValue === "" ||
            createCampaignvalues.PreferredCampaignBrands.length === 0) {
            return true;
        } else {
            return false;
        }
    };

    const handleContactChange = (name, email) => {
        setCreateCampaignValues({
            ...createCampaignvalues,
            CampaignContact: name,
            ContactEmailID: email
        });
    };

    const clearCampaignDate = () => {
        setCampaignDateValue('');
        setFromToTextCampaignDate(undefined);
        setFromCampaignDate(undefined);
        setToCampaignDate(undefined);
    };

    return (
        <div className="create-campaign-container">
            <AlertBox infoMessage={infoMessage} closeAlert={setInfoMessage} />
            
            <Card className='create-campaign-card-container'>
                <Card.Body>
                    <Card.Title>Create Campaign</Card.Title>
                    <div className="campaign-create">
                        <Row className="row-campaign">
                            <Col xs={4}>
                                <TextField
                                    label='Campaign Name'
                                    type='text'
                                    value={createCampaignvalues.CampaignName}
                                    onChange={e => handleChange(e, 'CampaignName')}
                                    placeholder='Enter Campaign Name'
                                    isRequired={true}
                                />
                            </Col>
                            <Col xs={4} >
                                <div>
                                    <TextField type="text" label="Campaign Date" isRequired={true} onChange={() => { }}
                                        value={campaignDateValue} title={campaignDateValue} placeholder={'Start Date - End Date'} className="truncate" />
                                    <div className="calendar-icon-container">
                                        {campaignDateValue && <span className="calendar-clear-icon" onClick={clearCampaignDate}>
                                            <RemoveIcon />
                                        </span>}
                                        <div className="calendar-icon" onClick={handleClickCampaignDate}>
                                            <CalendarIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <Overlay
                                            show={showCampaignDate}
                                            target={campaignDatetarget}
                                            placement="bottom"
                                            container={campaignDateRef.current}
                                            containerPadding={20}
                                            onHide={() => { }}
                                        >
                                            <Popover id="popover-contained">
                                                <Popover.Content>
                                                    <DatePicker
                                                        reference={campaignDateOverLay}
                                                        isMultiSupported={false}
                                                        defaultOption="Range"
                                                        callBack={campaignDateCallBack}
                                                        from={fromCampaignDate}
                                                        to={toCampaignDate}
                                                        disabledDays={[
                                                            {
                                                                before: new Date(),
                                                            }
                                                        ]}
                                                        closeDialog={() => setShowCampaignDate(!showCampaignDate)}
                                                    />
                                                </Popover.Content>
                                            </Popover>
                                        </Overlay>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={4}>
                                <MultiDropdown
                                    label='Brand Name'
                                    isRequired={true}
                                    options={Brand}
                                    placeholder='Select Brand Name'
                                    value={createCampaignvalues.PreferredCampaignBrands ?
                                        createCampaignvalues.PreferredCampaignBrands.map((item) => { return item['BrandIds'] }) : ''}
                                    onChange={(e) => handleMultiChange(e, 'PreferredCampaignBrands')}
                                    searchOptionRequired={true}
                                />
                            </Col>
                        </Row>
                        <Row className="notes-campaign">
                            <Col xs={8}>
                                <TextField
                                    label='Campaign Notes'
                                    type='text'
                                    placeholder='Enter Campaign, Context, Objective etc'
                                    value={createCampaignvalues.CampaignNotes}
                                    onChange={e => handleChange(e, 'CampaignNotes')}
                                />
                            </Col>
                            <Col xs={4}>
                                {/* <TextField
                                    label='Campaign Contact'
                                    type='text'
                                    value={createCampaignvalues.CampaignContact}
                                    onChange={e => handleChange(e, 'CampaignContact')}
                                /> */}
                                <AutoCompleteTextBox
                                    value={createCampaignvalues.CampaignContact}
                                    label="Campaign Contact"
                                    dataUrl={searchUserApi}
                                    callBack={({ Name, email }) => handleContactChange(Name, email)}
                                    onChange={() => { }}
                                />
                            </Col>
                        </Row>
                        <Row className="group-button"> 
                            <div className="cc-btnGroup">
                                <Button
                                    variant="primary"
                                    className="SearchBtn"
                                    onClick={saveCamapign}
                                    disabled={verifyCreateCampaign()}
                                    caption="Create Campaign"
                                />
                            </div>
                        </Row>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
export default CreateCampaign;