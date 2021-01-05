import React, { useState } from 'react';
//import { Card, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomeCards.css';
import { HomeNextPageBtn } from './SVG';
import { Spinner } from 'react-bootstrap';
import * as Constants from '../../utils/constants';

export default ({ digit, label, digitColor, btnColor, backgroundBoxColor, icon, onClickHandler, id, isLoading }) => {
    return (
        <div className="HomeCard" >
            <div className="Wrapper">
                <div className="svgRound" style={{ fill: digitColor, boxShadow: backgroundBoxColor }}>
                    {icon}
                </div>
                {/* spinner or response digit based on api */}
                <div className="bottomText">
                    {isLoading && id !== Constants.CREATEINVENTORY ?
                        <div className="styling-txt">
                            <Spinner animation="grow" role="status" style={{ color: digitColor }}>
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </div>
                        : <p className="Digit" style={{ color: digitColor, fontWeight: 'bold' }}>{digit || 0}</p>
                    }
                    <p className="Label">{label}</p>
                </div>
                <div className="d-none d-sm-none d-md-block d-lg-block d-xl-block btnWrapper">
                    <button className="btnNext" style={{ background: btnColor }} onClick={() => onClickHandler(id)}>
                        <HomeNextPageBtn />
                    </button>
                </div>
            </div>
        </div>
    )
}