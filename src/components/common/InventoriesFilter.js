import React, { useEffect, useState } from 'react';
import { TextField, PrimaryDropdown, MultiDropdown } from '../../components/common';
import Axios from 'axios';
import { serviceUrlHost } from '../../utils/apiUrls';
import './InventoriesFilter.css';

export default (props) => {

    
    const [dropdownOptions, setDropdownOptions] = useState({});

    useEffect(() => {
        if (!props.dropdownOptions) {
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
                    if(!props.statusOptions) {
                        setDropdownOptions({
                            ...dpOpts
                        })
                    } else {
                        setDropdownOptions({
                            ...dpOpts,
                            ...props.statusOptions
                        })
                    }
                })
                .catch(error => {
                    console.log('fetching dropdowns', error);
                });
        } else {
            setDropdownOptions(props.dropdownOptions);
        }
    }, [props.dropdownOptions, props.statusOptions]);

    const optionsVal = dropdownOptions ? {
        VenueType: dropdownOptions['VenueType'],
        MediaChannel: dropdownOptions['MediaChannel'],
        CampaignName: dropdownOptions['Campaign'],
        InventoryStatus: dropdownOptions['InventoryStatus']
    } : {};
    return (
        <>
            {['InventoryStatus'].indexOf(props.filterType) !== -1 && optionsVal[props.filterType] ?
                <MultiDropdown
                    value={props.value}
                    onChange={props.onChange}
                    options={optionsVal[props.filterType]}
                    placeholder="Select Status"
                    searchOptionRequired={false}
                /> :
                ['VenueType', 'MediaChannel', 'CampaignName'].indexOf(props.filterType) !== -1 && optionsVal[props.filterType] ?
                    <PrimaryDropdown
                        onChange={props.onChange}
                        options={optionsVal[props.filterType]}
                        placeholder={'Select Value'}
                        className="value-index"
                        value={props.value}
                        listHeight="filterHeight"
                        searchOptionRequired={true}
                    />
                    : <TextField
                        type="text"
                        onChange={props.onChange}
                        value={props.value}
                        className="text-color"
                        placeholder={'Enter Text'}
                    />}
        </>
    );
}