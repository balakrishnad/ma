import React, { useEffect } from 'react';
import Track from './Track';
import InventoryElement from './InventoryElement';
import { Container, Row, Col } from 'react-bootstrap';

export default (props) => {

    const { timeBar, sideBar, viewportWidth = 0, cb, time, zoom, inventoryCardProps, campaignData, statusFilter, statusSearchParam } = props;

    useEffect(() => {
        cb();
        window.addEventListener('resize', cb);
        return () => {
            window.removeEventListener('resize', cb)
        }
    }, [])


    return (
        <div className='tl-layout-tracks'>
            {/* <Container> */}
            {sideBar.map((obj, i) => {
                if (!obj.collapse) {
                    return <div key={i + '-tl-layout-tracks'} className='tl-layout-tracks-container'>{obj.elements.map((inv, i) => {
                        return <div className='tl-layout-tracks-element-container' key={i + '-tracks-row'}>
                            <Row>
                                {timeBar.map(({ id, startDate, endDate }) => (
                                    <div style={time.toStyleLeftAndWidth(startDate, endDate, 0)} key={id + '-tracks-col'} className='tl-layout-tracks-col'><Track /></div>
                                ))}
                            </Row>
                            {viewportWidth !== 0 && <InventoryElement inventoryCardProps={inventoryCardProps} statusSearchParam={statusSearchParam} statusFilter={statusFilter} campaignData={campaignData} time={time} inventoryArray={inv} zoom={zoom} />}
                        </div>
                    })} </div>
                } else {
                    return <div style={{ height: '4rem' }}>
                        <div className='tl-layout-tracks-empty-element-container' key={i + '-tracks-row'}>
                            <Row>
                                {timeBar.map(({ id, startDate, endDate }) => (
                                    <div style={time.toStyleLeftAndWidth(startDate, endDate, 0)} key={id + '-tracks-col'} className='tl-layout-tracks-col'><Track /></div>
                                ))}
                            </Row>
                        </div>
                    </div>
                }
            })}
            {/* </Container> */}
        </div>
    );
}