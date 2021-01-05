import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default (props) => {

    const { yearTimeBar, timeBar, width, time } = props;

    const getPeriodTime = (start, end) => {
        const sd = new Date(start).toDateString().split(' ');
        const ed = new Date(end).toDateString().split(' ');
        return sd[1] + " " + sd[2] + '-' + ed[1] + " " + ed[2];
    }

    return (
        <div className='tl-layout-header' id='tl-layout-header'>
            <div className='tl-layout-header-row'>
                <Row>
                    {[...yearTimeBar].map(({ year, start, end }, index) => {
                        let temp = new Date(start);
                        const s = index !== 0 ? new Date(temp.setDate(temp.getDate() - 1)) : start;
                        const e = end;
                        return <div key={index} className="tl-layout-header-col-year" style={time.toStyleLeftAndWidth(s, e, 0)}>
                            {year}
                        </div>
                    })}
                </Row>
                <Row>
                    {timeBar.map(({ id, periodName, startDate, endDate }, index) => {
                        let temp = new Date(startDate);
                        const s = index !== 0 ? new Date(temp.setDate(temp.getDate() - 1)) : startDate;
                        const e = endDate;
                        return <div key={id + '-header-col'} className="tl-layout-header-col" style={time.toStyleLeftAndWidth(s, e, 0)}>
                            {periodName}<br/><span className="tl-layout-header-col-period">{getPeriodTime(startDate, endDate)}</span>
                        </div>
                    })}
                </Row>
            </div>
        </div>
    );
}