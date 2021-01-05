import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './SideBar.css';
/*
    Creates the column for Media channel view
*/
export default (props) => {

    const { sideBar, collapseEvent } = props;

    return (
        <div className='tl-layout-sidebar'>
            <Container>
                <Row className="tl-layout-sidebar-header" id='tl-layout-sidebar-header'>
                    <Col>Media Channel</Col>
                </Row>
                {sideBar.map(({ id, name, elements, collapse }) => {
                    if (!collapse) {
                        return <Row key={id + '-side-bar-row'} className="tl-layout-sidebar-row" style={{ height: 64 * elements.length }}>
                            <div className="tl-layout-sidebar-col">
                                <span className="tl-layout-sidebar-collapse" onClick={() => collapseEvent(name, collapse)}>-</span>{name}
                            </div>
                        </Row>
                    } else if(elements.length > 0) {
                        return <Row key={id + '-side-bar-row'} className="tl-layout-sidebar-row side-bar-styling" >
                            <div className="tl-layout-sidebar-col">
                                <span className="tl-layout-sidebar-collapse" onClick={() => collapseEvent(name, collapse)}>+</span>{name}
                            </div>
                        </Row>
                    } else {
                        return <Row key={id + '-side-bar-row'} className="tl-layout-sidebar-row side-bar-styling">
                            <div className="tl-layout-sidebar-col">
                                {name}
                            </div>
                        </Row>
                    }
                })}
            </Container>
        </div>
    );
}