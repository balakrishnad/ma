import React from 'react';
import Layout from './Layout/Layout';

/*
    Creates the Layout for the time line, any changes to the Layout can be added here
*/
export default (props) => {

    const {
        yearTimeBar,
        timeBar,
        sideBar,
        start,
        end,
        zoom,
        inventoryCardProps,
        campaignData,
        statusFilter,
        statusSearchParam,
        collapseEvent }
        = props;

    return (
        <Layout
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
            collapseEvent={collapseEvent}></Layout>
    );
}