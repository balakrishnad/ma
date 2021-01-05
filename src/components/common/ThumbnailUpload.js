import React, { useEffect, useState } from 'react';
import { Spinner, Modal } from 'react-bootstrap';
import { Button, CloudIcon, CloseIcon } from './index';
import { DropzoneArea } from 'material-ui-dropzone';
import Axios from 'axios';
import { serviceUrlHost } from '../../utils/apiUrls';
import './ThumbnailUpload.css';
import UploadFilePlaceholder from '../../styles/images/upload-file-placeholder.svg';

const ThumbnailUpload = (props) => {

    const { showPopUp, fileSize, supportedFileArray, popUpControlCallBack, apiCallBack, uploadThumbnailObject } = props;
    const [show, setShow] = useState(false);
    const [postedFile, setPostedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isFileUploading, setIsFileUploading] = React.useState(false);

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

    const resetPopup = () => {
        setPostedFile(null);
        setFileName('');
    }

    const validateUploadButton = () => {
        if (!postedFile) {
            return true;
        } else {
            return false;
        }
    }

    const handleUploadClick = () => {
        if (fileName && postedFile && uploadThumbnailObject.MediaInventoryId &&
            uploadThumbnailObject.CampaignId) {
            setIsFileUploading(true);

            const formData = new FormData();

            formData.append('File', postedFile);
            formData.append('AssetId', uploadThumbnailObject.AssetId);
            formData.append('MediaInventoryId', uploadThumbnailObject.MediaInventoryId);
            formData.append('CampaignId', uploadThumbnailObject.CampaignId);
            formData.append('ModifiedBy', uploadThumbnailObject.ModifiedBy);
            formData.append('ModifiedDate', new Date().toISOString());

            Axios({
                url: `${serviceUrlHost}/api/Asset/UploadThumbnail/`,
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
                        Upload Thumbnail
                    </Modal.Title>
                    <span className="upload-thumbnail-style"
                        onClick={handleCloseForDialog}
                    >
                        <CloseIcon />
                    </span>
                </Modal.Header>
                <Modal.Body>
                    {isFileUploading &&
                        <div className='thumbnail-loading-container'>
                            <Spinner animation="border" variant="primary" />
                        </div>}
                    <DropzoneArea
                        filesLimit={1}
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
                            className="cloud-icon"
                        >
                            <CloudIcon />
                        </div>
                        <div
                            className="colud-styling"
                        >
                            <div className="drag-drop">
                              
                                {"Drag & Drop"}
                            </div>
                            <div className="file-sizing">
                           
                                your file here, or
                                            <a
                                    href="javascript:void(0);"
                                    className="icon-speciification">
                                    Browse
                                            </a>
                            </div>
                            <div className="color-of-size">
                           
                                Size limit: 200KB
                                <br />
                                (Image)
                            </div>
                        </div>
                        {!postedFile && <div className='upload-file-placeholder'>
                            <img src={UploadFilePlaceholder} />
                            <span className='upload-file-placeholder-text'>Uploaded file will appear here</span>
                        </div>}
                    </div>

                    <div className="button-styling">
                        <Button onClick={handleUploadClick} variant="primary" caption="Upload" disabled={validateUploadButton() || isFileUploading} />
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ThumbnailUpload;