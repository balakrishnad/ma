import React, { useEffect, useState } from 'react';
import { Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { Button, CloudIcon, CloseIcon, TextField } from './index';
import { DropzoneArea } from 'material-ui-dropzone';
import Axios from 'axios';
import { serviceUrlHost } from '../../utils/apiUrls';
import './CreateModifyAssetUpload.css';
import UploadFilePlaceholder from '../../styles/images/upload-file-placeholder.svg';
import * as Constants from '../../utils/constants';

const CreateModifyAssetUpload = (props) => {

    const {
        showPopUp,
        fileSize,
        supportedFileArray,
        editAsset,
        popUpControlCallBack,
        apiCallBack,
        uploadAssetObject,
        role,
        supportedFileText = 'Image, Video and Audio',
        uploadApiUrl = '/api/Asset/UploadAsset/'
    } = props;
    const [show, setShow] = useState(false);
    const [postedFile, setPostedFile] = useState(null);
    const [fileLink, setFileLink] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isFileUploading, setIsFileUploading] = React.useState(false);
    const [modificationNotes, setModificationNotes] = React.useState('');
    const [additionalComments, setAdditionalComments] = React.useState('');
    const [marketingCopy, setMarketingCopy] = React.useState(uploadAssetObject ? uploadAssetObject.MarketingCopy : '');
    const [legalDisclaimer, setLegalDisclaimer] = React.useState(uploadAssetObject ? uploadAssetObject.LegalDisclaimers : '');
    const [cta, setCTA] = React.useState(uploadAssetObject ? uploadAssetObject.CTA : '');
    const [brandVerificationStatus, setBrandVerificationStatus] = React.useState(false);

    useEffect(() => {
        setShow(showPopUp);
    }, [showPopUp]);


    const handleCloseForDialog = () => {
        popUpControlCallBack(false);
        resetPopup();
    };

    const onDrop = file => {
        setFileName(file.name);
        setPostedFile(file);
    };

    const onDelete = files => {
        setFileName("");
        setPostedFile(null);
    };

    const handleSpecSheetLink = e => {
        const value = e.target.value;
        if (validURL(value)) {
            setFileName(value);
            setFileLink(value);
        } else {
            setFileName('');
            setFileLink(null);
        }
    };

    const validURL = (str) => {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    };

    const resetPopup = () => {
        setPostedFile(null);
        setFileLink(null);
        setModificationNotes('');
        setAdditionalComments('');
        setBrandVerificationStatus(false);
        setMarketingCopy('');
        setLegalDisclaimer('');
        setCTA('');
    }

    const validateUploadButton = () => {
        if ((!postedFile && !fileLink) || (!editAsset && !brandVerificationStatus) || isFileUploading) {
            return true;
        } else {
            return false;
        }
    }

    const handleUploadClick = () => {
        if (fileName && (postedFile || fileLink) && uploadAssetObject.MediaInventoryId &&
            uploadAssetObject.CampaignId) {
            setIsFileUploading(true);

            const formData = new FormData();
            if (postedFile) {
                formData.append('File', postedFile);
            } else {
                formData.append('File', null);
                if (fileLink) {
                    formData.append('ExternalLink', fileLink);
                } else {
                    formData.append('ExternalLink', '');
                }
            }

            formData.append('MediaInventoryId', uploadAssetObject.MediaInventoryId);
            formData.append('CampaignId', uploadAssetObject.CampaignId);
            formData.append('CreatedBy', uploadAssetObject.CreatedBy);
            formData.append('ModifiedBy', uploadAssetObject.ModifiedBy);

            if (!editAsset) {
                formData.append('CreatedDate', new Date().toISOString());
                formData.append('BrandVerification', 1);
            } else {
                formData.append('AssetId', uploadAssetObject.AssetId);
                formData.append('Role', role);
            }

            if (uploadAssetObject && uploadAssetObject.venueType == 'Email'
                && role === Constants.BM) {
                formData.append('MarketingCopy', marketingCopy);
                formData.append('LegalDisclaimers', legalDisclaimer);
                formData.append('CTA', cta);
            }

            formData.append('ModifiedDate', new Date().toISOString());

            formData.append('ModificationNotes', editAsset ? modificationNotes : '');

            formData.append('AdditionalAssetComments', additionalComments);

            Axios({
                url: `${serviceUrlHost}${uploadApiUrl}`,
                method: 'post',
                headers: {
                    'Content-Type': 'multipart/formdata',
                    'Access-Control-Allow-Origin': true
                },
                data: formData,
            })
                .then(response => {
                    apiCallBack('Success');

                    setIsFileUploading(false);
                    resetPopup();
                    popUpControlCallBack(false);
                })
                .catch(error => {
                    console.log('error uploading file', error);
                    apiCallBack('Error');
                
                    setIsFileUploading(false);
                    resetPopup();
                    popUpControlCallBack(false);
                });
        }
    };

    return (
        <div>
            <Modal
                show={show}
                onClose={handleCloseForDialog}
                onHide={() => popUpControlCallBack(false)}
                dialogClassName="uploadControl"
                aria-labelledby="example-custom-modal-styling-title"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="example-custom-modal-styling-title">
                        {editAsset ? 'Modify Asset' : 'Upload Asset'}
                    </Modal.Title>
                    <span className="close-dailog-button"
                        onClick={handleCloseForDialog}
                    >
                        <CloseIcon />
                    </span>
                </Modal.Header>
                <Modal.Body>
                    {isFileUploading &&
                        <div className='upload-asset-loading-container'>
                            <Spinner animation="border" variant="primary" />
                        </div>}
                    <DropzoneArea
                        filesLimit={1}
                        // onChange={handleUploadChange}
                        // onSave={handleSaveUploadChange}
                        maxFileSize={fileSize}
                        dropzoneText={""}
                        dropzoneClass={"dropzone-area"}
                        showFileNames={true}
                        showFileNamesInPreview={true}
                        showPreviewsInDropzone={true}
                        acceptedFiles={supportedFileArray}
                        onDrop={onDrop}
                        onDelete={onDelete}
                    />

                    <div className="wrapper-placeholder"></div>
                    <div className="file-upload-info-text drangAndDropContext">
                        <div
                            className="cloud-icon">
                            <CloudIcon />
                        </div>
                        <div className="colud-styling"
                         
                        >
                        <div 
                       
                        className="icon-styling"></div>
                        
                            <div className="drag-drop-styling">
                                {"Drag & Drop"}
                            </div>
                            <div className="file-here-styling">
                                your file here, or
                                            <a
                                    href="javascript:void(0);"
                                    className="icon-speciification">
                                   
                                    Browse
                                            </a>
                            </div>
                            <div className="sizelimit-styline">
                                Size limit: 10mb
                                <br />
                                ({supportedFileText})
                            </div>
                        </div>
                        {!postedFile && <div className='upload-file-placeholder'>
                            <img src={UploadFilePlaceholder} />
                            <span className='upload-file-placeholder-text'>Uploaded file will appear here</span>
                        </div>}
                    </div>
                    <div className='upload-asset-url-container'>
                        <div className="or">OR</div>
                        <input type="text" onChange={handleSpecSheetLink} className="LinkInput"
                            placeholder="Paste Link for Assets Exceeding 10MB" />
                    </div>
                    {uploadAssetObject && uploadAssetObject.venueType == 'Email'
                        && role === Constants.BM &&
                        <Row>
                            <Col>
                                <TextField
                                    type="text"
                                    label="Marketing copy"
                                    onChange={(e) => { setMarketingCopy(e.target.value) }}
                                    value={marketingCopy}
                                />
                            </Col>
                            <Col>
                                <TextField
                                    type="text"
                                    label="Legal disclaimers"
                                    onChange={(e) => { setLegalDisclaimer(e.target.value) }}
                                    value={legalDisclaimer}
                                />
                            </Col>
                            <Col>
                                <TextField
                                    type="text"
                                    label="CTA"
                                    onChange={(e) => { setCTA(e.target.value) }}
                                    value={cta}
                                />
                            </Col>
                        </Row>
                    }
                    <div className="upload-asset-modification-notes-container">
                        <TextField
                            type="text"
                            label="Additional Comments"
                            onChange={(e) => { setAdditionalComments(e.target.value) }}
                            value={additionalComments}
                        />
                    </div>
                    {!editAsset && <div className='upload-asset-brand-verification-container'>
                        <Form.Check
                            custom
                            inline
                            label="I have verified the brand rights and cross functional approval (ie; legal, CR, PR, TM, etc.)"
                            type="checkbox"
                            onChange={(e) => { e.target.checked ? setBrandVerificationStatus(true) : setBrandVerificationStatus(false) }}
                            id={'custom-inline-checkbox'}
                        />
                    </div>}
                    {editAsset && <div className='upload-asset-modification-notes-container'>
                        <TextField
                            type="text"
                            label="Modification Notes"
                            onChange={(e) => { setModificationNotes(e.target.value) }}
                            value={modificationNotes}
                        />
                    </div>}

                    <div className="button-upload">
                        <Button onClick={handleUploadClick} variant="primary" caption="Upload" disabled={validateUploadButton() || isFileUploading} />
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default CreateModifyAssetUpload;