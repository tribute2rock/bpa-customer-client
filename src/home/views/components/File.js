import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import fileIcon from '../../../util/icons';
import React, { useState } from 'react';
import FileViewer from 'react-file-viewer';
import { Modal, ModalBody } from 'reactstrap';

const formatBytes = (bytes, decimals) => {
  if (bytes === 0) return '0 Bytes';
  let k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const truncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};

const File = (props) => {
  const { className } = props;
  const [modal, setModal] = useState(false);
  const [geturl, setUrl] = useState();

  const handleFileOnClick = () => {
    // let url = process.env.REACT_APP_CUSTOMER_FILE_URL;
    let appURL = process.env.REACT_APP_SERVER_URL;
    let url;

    if (props.fileRedirectUrl) {
      url = props.fileRedirectUrl;
    } else {
      url = `${appURL}/customer-uploads/:id/:type/:filename`;
      url = url.replace(':filename', props.fileUrlName);
      url = url.replace(':type', props.fileDest);
      url = url.replace(':id', props.fileUrlId);
    }
    setUrl(url);
    window.open(url, '_blank');
  };
  const onError = (e) => {
    // console.log(e, 'error in file-viewer');
  };

  return (
    <>
      <Modal isOpen={modal} toggle={handleFileOnClick}>
        <ModalBody className="custom-modal-style">
          <FileViewer fileType={props.fileType} filePath={geturl && geturl} onError={onError} />
        </ModalBody>
      </Modal>

      <OverlayTrigger
        key={props.fileKey}
        placement="bottom"
        overlay={<Tooltip id={props.toolTipId}>{props.fileFullName ? props.fileFullName : props.fileName}</Tooltip>}
      >
        <div className="btn text-dark" onClick={props.fileUrlId ? handleFileOnClick : null} style={{ lineHeight: '1' }}>
          <small className="font-weight-bold d-block ">{truncateString(props.fileName, 13)}</small>
          <small>{formatBytes(props.fileSize)}</small>
        </div>
      </OverlayTrigger>
    </>
  );
};

export default File;
