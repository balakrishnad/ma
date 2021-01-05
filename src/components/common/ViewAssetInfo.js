import React, { Fragment, useState, useEffect } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { BackToIcon, DownloadIcon, AssetEditIcon, AssetLinkIcon, ThumbnailIcon } from '../../components/common';
import CustomLabel from './CustomLabel';
import assetInfoIcon from '../../styles/images/app_logo.png';
import './ViewAssetInfo.css';
import { serviceUrlHost } from '../../utils/apiUrls';
import Axios from 'axios';
import ModificationNotes from './ModificationNotes';
import 'bootstrap/dist/css/bootstrap.min.css';

export default (props) => {

    const [showTooltip, setShowTooltip] = useState(false);

    const validateData = (dataString, isCurrency) => {
        if (!dataString) {
            return '';
        } else {
            if (isCurrency) {
                dataString = '$ ' + dataString;
            }
            return dataString;
        }
    };

    const showToolTipMessage = () => {
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 1500);
    }

    const updateDownloadCount = (callBack, data) => {
        Axios({
            url: serviceUrlHost + '/api/Asset/DownloadCount/' + data.assetId,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            }
        }).then((response) => {
            // console.log(response);
            callBack('Success');
        }).catch((error) => {
            console.log(error);
            callBack('Error');
        })
    };

    const getModificationNotes = () => {
        if (props.data.AssetDetails.ModificationNotes) {
            let mNotes = props.data.AssetDetails.ModificationNotes;
            mNotes = mNotes.split('[NewNote]');
            const note = mNotes.map((note) => {
                return note.split('[NewLine]')
            });
            return note;
        }
    };

    const getModificationTitle = (notes) => {
        if (notes) {
            notes = notes.replace(/\[NewLine]/gi, ' ');
            if (notes.includes('[NewNote]')) {
                notes = notes.replace(/\[NewNote]/gi, ' ');
            }
        }
        return notes;
    };
    return (
        <div className='view-asset-info-container'>
            <div className='view-asset-info-back' onClick={() => { props.backAction() }}><BackToIcon />{props.backText}</div>
            <div className='view-asset-info-label'>View Asset</div>
            <Card>
                <div className="view-asset-info-data-container">
                    <Container fluid={true} className="ImageWarpper">
                        <div className="view-asset-info-media">
                            <div className="view-asset-info-media-content">
                                <img className="img-styling" src={props.data.AssetDetails.ThumbNail ? "data:image/png;base64," + props.data.AssetDetails.ThumbNail : assetInfoIcon}></img>
                            </div>
                            <div className="d-none d-md-block d-sm-none view-asset-width">
                                {props.assetProps && props.data.downloadLink && <Fragment>
                                    {props.assetProps.assetLeftActionImage && <a className="asset-action-icon asset-left-action-icon" style={props.assetProps.assetLeftActionImage.style}
                                        onClick={() => {
                                            updateDownloadCount(props.assetProps.assetLeftActionImage.actionHandler, props.data);
                                        }}
                                        href={props.data.downloadLink} target="_blank" download>
                                        {/* <img src={props.assetProps.assetLeftActionImage.icon}></img> */}
                                        <DownloadIcon />
                                    </a>}
                                    {props.assetProps.assetMiddleActionImage && <span className="asset-action-icon asset-middle-action-icon" style={props.assetProps.assetMiddleActionImage.style}
                                        onClick={() => { props.assetProps.assetMiddleActionImage.actionHandler(props.data) }}>
                                        {/* <img src={props.assetProps.assetMiddleActionImage.icon}></img> */}
                                        <AssetEditIcon />
                                    </span>}
                                    {props.assetProps.assetRightActionImage && <span className="asset-action-icon asset-right-action-icon" style={props.assetProps.assetRightActionImage.style}
                                        onClick={() => { props.assetProps.assetRightActionImage.actionHandler(props.data); showToolTipMessage() }}>
                                        {/* <img src={props.assetProps.assetRightActionImage.icon}></img> */}
                                        <AssetLinkIcon />
                                    </span>}
                                    {props.assetProps.assetThumbnailActionImage && <span className="asset-action-icon asset-right-action-icon-2" style={props.assetProps.assetRightActionImage.style}
                                        onClick={() => { props.assetProps.assetThumbnailActionImage.actionHandler(props.data); }}>
                                        {/* <img src={props.assetProps.assetRightActionImage.icon}></img> */}
                                        <ThumbnailIcon />
                                    </span>}
                                    {showTooltip ? <span className='toolTip-Message'>Link Copied</span> : null}
                                </Fragment>}
                            </div>
                        </div>
                        <div className="view-asset-info-data">
                            <Row>
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="Inventory Type" value={validateData(props.data.AssetDetails.InventoryType)} /></Col>
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="Spec Dimensions" value={validateData(props.data.AssetDetails.SpecDimensions)} /></Col>
                                <Col md={3} xs={6} ><CustomLabel name="Color or Black/ White" value={validateData(props.data.AssetDetails.ColorType)} /></Col>
                            </Row>
                            <Row>
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="Location" value={validateData(props.data.AssetDetails.LocationDetails)} /></Col>
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="File Format (physical/digital/audio/other)" value={validateData(props.data.AssetDetails.FileFormat)} /></Col>
                                <Col md={3} xs={6}><CustomLabel name="Current Status" value={validateData(props.data.AssetDetails.CurrentStatus)} /></Col>
                            </Row>
                            <Row>
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="Asset Type" value={validateData(props.data.AssetDetails.AssetType)} /></Col>
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="Annual Traffic" value={validateData(props.data.AssetDetails.AnnualTraffic)} /></Col>
                                <Col md={3} xs={6}><CustomLabel name="Asset Description" value={validateData(props.data.AssetDetails.AssetDescription)} /></Col>
                            </Row>
                            <Row >
                                <Col md={3} xs={6} className="borderRight"><CustomLabel name="Quantity per outlet" value={validateData(props.data.AssetDetails.QuantityPerOutlet)} /></Col>
                                {props.data && props.data.VenueType === 'Email' &&
                                    <Col md={3} xs={6} ><CustomLabel className="borderRight" name="Legal disclaimers" value={validateData(props.data.AssetDetails.LegalDisclaimers)} /></Col>
                                }
                                {props.data && props.data.VenueType === 'Email' &&
                                    <Col md={3} xs={6} ><CustomLabel name="CTA" value={validateData(props.data.AssetDetails.CTA)} /></Col>
                                }
                            </Row>

                            {props.data.AssetDetails.MarketingCopy &&
                                <Row>
                                    {props.data && props.data.VenueType === 'Email' &&
                                        <Col md={3}><CustomLabel className="borderRight" name="Marketing copy" value={validateData(props.data.AssetDetails.MarketingCopy)} /></Col>
                                    }
                                </Row>
                            }

                            {props.data.AssetDetails.AdditionalAssetComments &&
                                <Row className="additional-comments-styling">
                                    <Col>
                                        <CustomLabel name="Additional Comments" value={getModificationTitle(props.data.AssetDetails.AdditionalAssetComments)}
                                            maxwidth='100%' maxheight='3.8rem' tooltipEnabled={true} tooltipInline={true}
                                        // valueAsHTML={<ModificationNotes notes={getModificationNotes()} />} 
                                        />
                                    </Col>
                                </Row>
                            }

                            {props.data.AssetDetails.ModificationNotes &&
                                <Row className="mondify-notes">
                                    <Col>
                                        <CustomLabel name="Modification Notes" value={props.data.AssetDetails.ModificationNotes}
                                            maxwidth='100%' maxheight='3.8rem' tooltipEnabled={true} tooltipInline={true}
                                            valueAsHTML={<ModificationNotes notes={getModificationNotes()} />} />
                                    </Col>
                                </Row>
                            }











                            {/* <Row>
                                <Col xs={6} md={4}><CustomLabel name="Inventory Type" value={validateData(props.data.AssetDetails.InventoryType)} /></Col>
                                <Col><CustomLabel name="Location" value={validateData(props.data.AssetDetails.LocationDetails)} /></Col>
                                <Col><CustomLabel name="Asset Type" value={validateData(props.data.AssetDetails.AssetType)} /></Col>
                                <Col><CustomLabel name="Quantity per outlet" value={validateData(props.data.AssetDetails.QuantityPerOutlet)} /></Col>
                                {props.data && props.data.VenueType === 'Email' &&
                                    <Col><CustomLabel name="Marketing copy" value={validateData(props.data.AssetDetails.MarketingCopy)} /></Col>
                                }
                            </Row>
                            <Row>
                                <Col><CustomLabel name="Spec Dimensions" value={validateData(props.data.AssetDetails.SpecDimensions)} /></Col>
                                <Col><CustomLabel name="File Format (physical/digital/audio/other)" value={validateData(props.data.AssetDetails.FileFormat)} /></Col>
                                <Col><CustomLabel name="Annual Traffic" value={validateData(props.data.AssetDetails.AnnualTraffic)} /></Col>
                                {props.data && props.data.VenueType === 'Email' &&
                                    <Col><CustomLabel name="Legal disclaimers" value={validateData(props.data.AssetDetails.LegalDisclaimers)} /></Col>
                                }
                                <Col></Col>
                            </Row>
                            <Row xs={6} md={4}>
                                <Col><CustomLabel name="Color or Black/ White" value={validateData(props.data.AssetDetails.ColorType)} /></Col>
                                <Col><CustomLabel name="Current Status" value={validateData(props.data.AssetDetails.CurrentStatus)} /></Col>
                                <Col><CustomLabel name="Asset Description" value={validateData(props.data.AssetDetails.AssetDescription)} /></Col>
                                {props.data && props.data.VenueType === 'Email' &&
                                    <Col><CustomLabel name="CTA" value={validateData(props.data.AssetDetails.CTA)} /></Col>
                                }
                            </Row> */}
                        </div>
                    </Container>
                </div>
                {/* <div className='m-notes'>
                    <div className="asset-modification-notes" style={{ width: '100%' }}>
                        <CustomLabel name="Modification Notes" value={getModificationTitle(props.data.AssetDetails.ModificationNotes)} maxwidth='90%' maxheight='3.8rem' tooltipEnabled={true} tooltipInline={true}
                            valueAsHTML={<ModificationNotes notes={getModificationNotes()} />} />
                    </div>
                </div> */}
            </Card>
        </div>
    );
}