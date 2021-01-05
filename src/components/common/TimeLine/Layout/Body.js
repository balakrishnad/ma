import React, { useRef, useState } from 'react';
import Header from './Header';
import Tracks from './Tracks';
import './Layout.css';
import createTime from '../Util/Time'

/*
    Creates the Header (displays periods) and tracks (Actual time line for inventory) for the time line view
*/
export default (props) => {

    const { yearTimeBar, timeBar, sideBar, start, end, zoom, inventoryCardProps, campaignData, statusFilter, statusSearchParam } = props;
    const timeLineBody = useRef();
    const [timeLineBodyWidth, setTimeLineBodyWidth] = useState(-1);

    /*
        Time js Object for claculating the position and width of inventory on time line viewport arear
    */
    const time = createTime({
        start: start,
        end: end,
        zoom: zoom,
        viewportWidth: timeLineBodyWidth
    });

    const bodyCallBack = () => {
        setTimeLineBodyWidth(timeLineBody.current.offsetWidth);
    }

    return (
        <div id='tl-layout-body' className='tl-layout-body' ref={timeLineBody} style={{overflow: zoom > 1 ? 'auto' : 'hidden'}}>
            {timeLineBodyWidth > 0 && <Header yearTimeBar={yearTimeBar} timeBar={timeBar} width={time.timelineWidthStyle} time={time}></Header> }
            <Tracks inventoryCardProps={inventoryCardProps} statusSearchParam={statusSearchParam} statusFilter={statusFilter} campaignData={campaignData} timeBar={timeBar} sideBar={sideBar} start={start} end={end} viewportWidth={timeLineBodyWidth} cb={bodyCallBack} time={time} zoom={zoom}></Tracks>
        </div>
    );
}