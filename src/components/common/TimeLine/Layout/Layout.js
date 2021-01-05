import React from 'react';
import Body from './Body';
import SideBar from './SideBar';
import './Layout.css';

/*
    Creates the side bar(Media channel column) and body (time line body) for time line
    Time line scorlling is handled here
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
        collapseEvent
    } = props;

    const leftScroll = () => {
        if (zoom === 1) {
            return false;
        }
        scroll(document.getElementById('tl-layout-body'), -300, 100);
    }

    const rightScroll = () => {
        if (zoom === 1) {
            return false;
        }
        scroll(document.getElementById('tl-layout-body'), 300, 100);
    }

    const scroll = (element, change, duration) => {
        var start = element.scrollLeft,
            currentTime = 0,
            increment = 20;

        var animateScroll = function () {
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    Math.easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    return (
        <div className='tl-layout-main'>
            <div className='tl-layout-main-header'>
                <div className='tl-layout-main-legend'>
                    <div className="tl-layout-legend-available-element"></div><span> - Available</span>
                    <div className="tl-layout-legend-hold-element"></div><span> - Hold</span>
                    <div className="tl-layout-legend-locked-element"></div><span> - Locked</span>
                    <div className="tl-layout-legend-blackout-element"></div><span> - Blackout</span>
                </div>
                <div className='tl-layout-main-scroll'>
                    <div className="arrow-left" onClick={leftScroll}></div>
                    <div className="arrow-right" onClick={rightScroll}></div>
                </div>
            </div>
            <div id='timeline-view'>
                <SideBar sideBar={sideBar} collapseEvent={collapseEvent}></SideBar>
                <Body
                    inventoryCardProps={inventoryCardProps}
                    statusSearchParam={statusSearchParam}
                    statusFilter={statusFilter}
                    campaignData={campaignData}
                    yearTimeBar={yearTimeBar}
                    timeBar={timeBar}
                    sideBar={sideBar}
                    start={start}
                    end={end}
                    zoom={zoom}></Body>
            </div>
        </div>
    );
}