import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getFiles, getSingleRequestById, getRequestTemplate,createAndDownloadPdf } from './api/request';
import { getDataByCategoryId } from './../category/api/category';
import { addComments } from './api/workFlowLogs';
import metaRoutes from '../../../config/meta_routes';
import { Link } from 'react-router-dom';
import query from 'querystring';
import A from '../../../config/url';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import status from './constants';
import { Form, Col, Modal, Dropdown } from 'react-bootstrap';
import FormBuilder from 'drag-and-drop-form-builder-2';
import HTMLFormRender from '../forms/components/HTMLFormRender';
import { deleteDraftRequest, getDraftFormsByRequestKey } from './api/draftRequest';
import toastConst from '../../../constants/toast';
import File from '../components/File';
import { convertToRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Swal from 'sweetalert2';
import CustomDropzone from './components/CustomDropzone';
import ReactToPrint from 'react-to-print';
import { getAllBranches } from './api/draftRequest';
import purify from 'dompurify';
import HTMLFormRenderView from '../forms/components/HTMLFormRenderView';
import { ModalBody } from 'reactstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import InnerHTML from 'dangerously-set-html-content';

const RequestDetails = (props) => {
  let componentRef = useRef();
  const [getRequest, setGetRequest] = useState([]);
  const [modelShow, setModelShow] = useState(false);
  const [type, setType] = useState(false);
  const [comment, setComment] = useState({});
  const [workflowLogs, setWorkflowLogs] = useState([]);
  const [commentShow, setcommentShow] = useState(false);
  const [category, setCategory] = useState();
  const [requestTemplates, setRequestTemplates] = useState([]);
  const [editorValue, setEditorValue] = useState(EditorState.createEmpty());
  const [branchList, setBranchList] = useState([]);
  const userInfo = useSelector((state) => state.user?.userInfo);
  const userToken = useSelector((state) => state.user?.token);
  const populateURL = process.env.REACT_APP_POPULATE_URL;
  const bank_server_url = process.env.REACT_APP_SERVER_URL;
  const [previewData, setPreviewData] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templatePreview, setTemplatePreview] = useState(false);

  const [workflowFiles, setWorkflowFiles] = useState([]);

  const qs = query.parse(props.location.search);
  const id = A.getId(qs['?i']);
  const getStatus = qs['?s'];

  const getBranch = () => {
    getAllBranches((err, data) => {
      if (err) {
        toast.error('Error retrieving Branches!');
      } else {
        setBranchList(data.data);
      }
    });
  };

  useEffect(() => {
    getBranch();
    if (getStatus == status.drafts) {
      getDraftFormsByRequestKey(id, (data, err) => {
        if (!err) {
          setType(data.form.type);
          setGetRequest(data);

          setCategory(data.form.category.name);
          //Retriving category using category id
          // getDataByCategoryId(id, (err, data) => {
          //   if (!err) {
          //     setCategory(data.data.parent.name);
          //   }
          // });
        } else {
          toast.error(('Failed to get Draft Single Requests.', toastConst.error));
        }
      });
    } else {
      getSingleRequestById(id, (err, data) => {
        if (!err) {
          const form = data.data.form;
          setType(form.type);
          setGetRequest(data.data);
          setWorkflowLogs(data.data.workflow_logs);
          setCategory(form?.category?.name ? form.category.name : '');
          setComment({
            requestId: id,
            actionId: 1,
            comment: null,
            createdAt: null,
          });
        } else {
          toast.error('Failed to get Single Requests.', toastConst.error);
        }
      });
    }

    // Setting request template data on get Request
    //TODO: Remove additional request and include in the same getSingleRequestById.
    getRequestTemplate(id, (err, data) => {
      setRequestTemplates(data);
    });
  }, [id, getStatus, commentShow]);
  //eslint-disable-line
  const handleChangeComment = (editorValues) => {
    setEditorValue(editorValues);
    const editorHTML = draftToHtml(convertToRaw(editorValue.getCurrentContent()));
    setComment({ ...comment, comment: editorHTML });
  };
  const handleSubmitComment = (e, submitType) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('actionId', comment.actionId);
    formData.append('comment', comment.comment ? comment.comment : '<p></p>');
    formData.append('requestId', comment.requestId);
    formData.append('submitType', submitType);
    workflowFiles.map((file) => {
      formData.append('files', file);
    });
    addComments(formData, (err, data) => {
      for (let [key, val] of formData.entries()) {
        if (key == 'files') {
          const fileType = val.type.split('/')[1];
          if (
            fileType !== 'jpeg' &&
            fileType !== 'jpg' &&
            fileType !== 'png' &&
            fileType !== 'pdf' &&
            fileType !== 'docx' &&
            fileType !== 'plain'
          ) {
            return toast.error('Enter Only JPEG, JPG, PNG, PDF, DOCX or TXT File Type');
          }
          if (val.size > 3145728) {
            return toast.error('File Size exceeds 3MB');
          }
        }
      }
      if (err) {
        toast.error(err.response.data.message ?? 'Error in submmiting comment.', toastConst.error);
      }
      if (data) {
        setcommentShow(true);
        toast.success(data.message ?? 'Comment  added successfully.', toastConst.success);
        window.location.reload();
      }
    });
  };

  const htmlToPlainText = (msg) => {
    if (msg && msg != null) {
      const plainString = msg.replace(/<[^>]+>/g, '');
      return plainString;
    } else {
      return '';
    }
  };

  const handleModel = () => {
    setModelShow(true);
  };
  const handleClose = () => {
    setModelShow(false);
  };

  const commentValues = (requestId, groupId, nextGroupId, currentUserId) => {
    setComment({
      ...comment,
      requestId: requestId,
      groupId: null,
      nextGroupId: groupId,
      currentUserId: null,
    });
  };

  const statusname = (para) => {
    const statusid = para - 1;
    return Object.keys(status).map((val, key) => (statusid === key ? val : null));
  };

  const statusDetails = (statusId) => {
    switch (statusId) {
      case 1:
        return 'badge  badge-pill badge-primary';

      case 2:
        return 'badge  badge-pill badge-info';

      case 3:
        return 'badge  badge-pill badge-danger';

      case 4:
        return 'badge  badge-pill badge-success';

      case 5:
        return 'badge  badge-pill badge-warning';

      default:
        return '';
    }
  };

  const handleDelete = async (id) => {
    const confirmValue = await Swal.fire({
      title: '',
      text: 'Are you sure you want to permanently delete this draft?',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      confirmButtonColor: 'red',
    });
    if (confirmValue.value) {
      deleteDraftRequest(id, (err, data) => {
        if (!err) {
          toast.info(data.message);
          props.history.push('/home/requests-history');
        } else {
          toast.error('Failed to delete draft request');
        }
      });
    }
  };

  /**
   * Redirects a user to new tab for downloading the contents of the request template.
   *
   * @param {*} requestId
   * @param {*} templateId
   */
  const handleRequestTemplateDownload = (requestId, templateId) => {
    let downloadUrl =
      bank_server_url +
      '/download-request/:requestId/:templateId?action=download'
        .replace(':requestId', requestId)
        .replace(':templateId', templateId);
    window.location.href = downloadUrl;
  };


    /**
   * opens model for Preview template.
   *
   * @param {*} requestId
   * @param {*} templateId
   */
  const handleRequestTemplatePreview = async (requestId, templateId) => {
    let fileRequest = await createAndDownloadPdf(requestId, templateId);
    let data = fileRequest.data.replace(/\n/g, '<br/>');
      setPreviewData(data);
      setSelectedTemplate(templateId);
      setTemplatePreview(true);
  };

  //Preview Style
  const printStyle = { size: 'A4', marginTop: '2.54cm', textAlign: 'justify', orientation: 'portrait', scale: '100%;' };
 
  const validateForm = () => {
    return comment?.comment?.length > 0;
  };

  const handleCommentPost = (e) => {
    setComment({ ...comment, comment: e.target.value });
  };

  const handleFileDrop = (acceptedFiles) => {
    setWorkflowFiles([...workflowFiles, ...acceptedFiles]);
  };

  const handleFileRemove = (i) => {
    const newFiles = [...workflowFiles];
    newFiles.splice(i, 1);
    setWorkflowFiles(newFiles);
  };
  return (
    <>
      <Modal size="xl" show={modelShow} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{getRequest.form ? getRequest.form.name : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container content-section">
            <div className="text-right mb-2">
              <ReactToPrint
                trigger={() => <button className="btn btn-secondary btn-sm mr-1">Print this out!</button>}
                content={() => componentRef}
              />
                 <style>
                {`@media print {
                    @page {
                      margin: 1cm 1cm 1cm 2cm;
                      @top-center {
                        content: "";
                      }
                      @bottom-center {
                        content: "";
                      }
                    }
                    .my-printed-component {
                      page-break-before: auto;
                    }
                    }`}
              </style>
            </div>
            <div className="inner-content-border h-100">
              <div className="vertical-tab-body">
                <div className="tab-content">
                  <div className="tab-cnt-single">
                    <div className="inner-item-box">
                      <div className="row">
                        <div className="col-12">
                          <div className="react-form-builder-form" ref={(el) => (componentRef = el)}>
                            <small className="mr-4 d-block d-md-inline-block">
                              Requested Date :{' '}
                              <b>
                                {new Date(getRequest.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}{' '}
                              </b>
                            </small>
                            <small className="d-block d-md-inline-block ml-4">
                              Branch : {branchList?.find((item) => item.sol == getRequest?.requestedBranch)?.name}(
                              {getRequest?.requestedBranch})
                            </small>

                            {getRequest && getRequest.requestKey ? (
                              <>
                                <small className="d-block d-md-inline-block pl-5">
                                  {' '}
                                  <b> Key :</b> {getRequest.requestKey}
                                </small>
                              </>
                            ) : null}
                            {/* {!getRequest.form ? (
                                <h1>...</h1>
                              ) : getRequest.form.type==='html'?(
                              <HTMLFormRender
                              requestValues={
                                getRequest?.request_values ||
                                getRequest?.draft_request_values
                              }
                                formData={
                                  getRequest.form
                                    ? getRequest.form.formData.slice(1, -1)
                                    : []
                                }
                              />
                              ):
                              null} */}
                            {getRequest ? (
                              <>
                                {type && type === 'html' ? (
                                  <>
                                    <div className="body-overlay">
                                  {getRequest?.form?.name === 'BG Form Decentralized' ||
                                      getRequest?.form?.name === 'BG Form Centralized' ? (
                                        <HTMLFormRenderView
                                          requestValues={getRequest?.request_values || getRequest?.draft_request_values}
                                          formData={getRequest.form ? getRequest.form.viewData : []}
                                          javascript={getRequest.form ? getRequest.form.viewScript : ''}
                                        />
                                      ) : (
                                        <HTMLFormRender
                                          requestValues={getRequest?.request_values || getRequest?.draft_request_values}
                                          formData={getRequest.form ? getRequest.form.formData : []}
                                          javascript={getRequest.form ? getRequest.form.javascript : ''}
                                        />
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="body-overlay">
                                      <FormBuilder.ReactFormGenerator
                                        draft_action_name=""
                                        answer_data={
                                          getRequest.request_values
                                            ? getRequest.request_values.map((reqVal) => ({
                                                id: reqVal.id,
                                                name: reqVal.name,
                                                value: JSON.parse(reqVal.value),
                                              }))
                                            : getRequest.draft_request_values
                                            ? getRequest.draft_request_values.map((reqVal) => ({
                                                id: reqVal.id,
                                                name: reqVal.name,
                                                value: JSON.parse(reqVal.value),
                                              }))
                                            : []
                                        }
                                        data={JSON.parse(getRequest.form ? getRequest.form.formData : null)}
                                        hide_actions
                                        read_only
                                        accessToken={userToken.accessToken}
                                        autoPopulateUrl={populateURL}
                                      />
                                    </div>
                                  </>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
     
      <Modal
        size="xl"
        show={templatePreview}
        onHide={() => {
          setTemplatePreview(false);
        }}
      >
        <ModalHeader>
          <button
            className="btn text-light btn-secondary btn-sm mr-1"
            onClick={() => handleRequestTemplateDownload(id, selectedTemplate)}
          >
            Download
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="print-this-out" dangerouslySetInnerHTML={{ __html: previewData }} style={printStyle} />
        </ModalBody>
      </Modal>
      <div className="content-section">
        <h6 class="page-title clearfix">
          <div className="float-left">
            <span className="mb-1 d-block">
              {getRequest.form ? getRequest.form.name : null}{' '}
              {getRequest && getRequest.requestKey ? (
                <>
                  <small className="d-block d-md-inline-block">
                    {' '}
                    <b>(ID) :</b> {getRequest.requestKey}
                  </small>
                </>
              ) : null}
            </span>
            <small className="mr-4 d-block d-md-inline-block">
              Submitted Date :{' '}
              <b>
                {new Date(getRequest.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
              </b>
            </small>
            <small className="d-block d-md-inline-block">
              Status : <span className={statusDetails(getRequest.statusId)}> {statusname(getRequest.statusId)}</span>
            </small>
            <small className="d-block d-md-inline-block ml-4">
              Branch : {branchList?.find((item) => item.sol == getRequest?.requestedBranch)?.name}(
              {getRequest?.requestedBranch})
            </small>

            <small className="mb-2 mb-md-0 ml-md-4 d-block d-md-inline-block">
              Category: <b>{category ? category : null}</b>
            </small>

            {/* <span class="badge  badge-pill badge-info">Processing</span>
            <span class="badge  badge-pill badge-danger">Returned</span>
            <span class="badge  badge-pill badge-warning">Drafts</span>
            <span class="badge  badge-pill badge-success">completed</span> */}
          </div>
          <div className="float-right">
            <Link
              to={{
                pathname: metaRoutes.requestHistory,
                // search: "?i=" + A.getHash(request.id),
                // status: props.status,
                // state: { RequestDetails: "?i=" + A.getHash(request.id) },
              }}
            >
              <button type="button" className="btn text-dark btn-light btn-sm mr-1">
                <i className="fa fa-chevron-left text-danger"></i> Go Back
              </button>
            </Link>

            <button onClick={handleModel} type="button" className="btn btn-secondary btn-sm mr-1">
              <i className="fa fa-eye"></i> View
            </button>
            {getRequest.statusId == 1 || getRequest.statusId == 3 || getRequest.statusId == 5 ? (
              getRequest.statusId == 1 || getRequest.statusId == 3 ? (
                <>
                  <Link
                    to={{
                      pathname: metaRoutes.formEdit,
                      search: '?i=' + A.getHash(getRequest.id) + '&type=return',
                      status: props.status,
                      state: {
                        formEdit: '?i=' + A.getHash(getRequest.id) + '&type=return',
                      },
                    }}
                  >
                    <button type="button" className="btn btn-secondary btn-sm mr-1">
                      <i className="fa fa-pencil-alt"></i> Edit
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={{
                      pathname: metaRoutes.formEdit,
                      search: '?i=' + A.getHash(getRequest.id) + '&type=draft',
                      status: props.status,
                      state: {
                        formEdit: '?i=' + A.getHash(getRequest.id) + '&type=draft',
                      },
                    }}
                  >
                    <button type="button" className="btn btn-secondary btn-sm mr-1">
                      <i className="fa fa-pencil-alt"></i> Edit
                    </button>
                  </Link>
                </>
              )
            ) : null}
            {getStatus == 5 ? (
              <>
                <button onClick={() => handleDelete(getRequest.id)} type="button" className="btn btn-danger btn-sm mr-1">
                  <i className="fa fa-trash"></i> Delete
                </button>
              </>
            ) : getStatus == 1 || getStatus == 2 || getStatus == 3 || getStatus == 4 ? (
              <>
                <Link
                  to={{
                    pathname: metaRoutes.formEdit,
                    search: '?i=' + A.getHash(getRequest.id) + '&type=re-submit',
                    status: props.status,
                    state: {
                      formEdit: '?i=' + A.getHash(getRequest.id) + '&type=re-submit',
                    },
                  }}
                >
                  <button type="button" className="btn btn-secondary btn-sm mr-1">
                    <i className="fa fa-pencil-alt"></i> Re-Submit
                  </button>
                </Link>
              </>
            ) : null}

            {requestTemplates && requestTemplates.length > 0 && (
              <Dropdown className="mt-2 d-inline">
                <Dropdown.Toggle variant="secondary" id="dropdown-download">
                  Download
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {requestTemplates.map((template) => {
                    return (
                      <Dropdown.Item onClick={() => handleRequestTemplatePreview(id, template.id )}>
                        {template.name}
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </h6>
        {/* {getStatus & (getStatus !== status.drafts) ? (
          <div class="jumbotron w-100 p-3">
            <p class="m-0 text-center">
              <b>No Timeline Information</b>
              <br />
              <small className="text-muted">Visit Again Later</small>
            </p>
          </div>
        ) : null} */}

        {workflowLogs && workflowLogs.length > 0 ? (
          <div className="timeline-detail-box">
            <h5 className="mb-3 ml-3 pt-3">Timeline Information</h5>
            <hr />
            <ul className="timeline">
              {workflowLogs.map((item) => {
                return (
                  <li>
                    <div className="timeline-time">
                      <span className="time">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="date">
                        {['Sun', 'Mon', 'Tues', 'Wed', 'Thrus', 'Fri', 'Sat'][new Date(item.createdAt).getDay()]}
                        &#160;
                        {new Date(item.createdAt).toLocaleString('en-US', {
                          hour: 'numeric',
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div className="timeline-icon">
                      <a href="javascript:;">&nbsp;</a>
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-header border-0 pb-0">
                        <span className="userimage">
                          <i
                            className="fa fa-user-circle"
                            style={{
                              color: item.actionId === 1 || item.actionId === 11 ? 'red' : 'blue',
                            }}
                          ></i>
                        </span>
                        <span className="username">
                          {item.actionId === 1 || item.actionId === 11
                            ? item.comment != null
                              ? 'You sent a message.'
                              : 'You forwarded the request.'
                            : 'Bank returned the request.'}
                        </span>
                      </div>
                      {item.comment ? (
                        <div className="timeline-content border-bottom border-top pt-3">
                          {/* <p> {htmlToPlainText(item.comment)}</p> */}
                          <div dangerouslySetInnerHTML={{ __html: purify.sanitize(item.comment) }} />
                        </div>
                      ) : null}
                      {item.workflow_files && item.workflow_files.length > 0 && (
                        <div className="timeline-footer mt-0">
                          <a href="javascript:;" className="btn btn-light  text-dark">
                            {item.workflow_files.map((row, index) => {
                              return (
                                <>
                                  <i className="fa fa-file-image fa-fw fa-lg m-r-3" />
                                  <File
                                    fileKey={`request-file-${index}`}
                                    toolTipId={`request-file-tooltip-${index}`}
                                    fileName={row.originalName}
                                    fileFullName={row.originalName}
                                    fileType={row.mimeType}
                                    fileSize={row.size}
                                    fileUrlId={row.id}
                                    fileUrlName={row.filename}
                                    fileRedirectUrl={row.url}
                                    fileDest={'workflow'}
                                  />
                                </>
                              );
                            })}
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div class="jumbotron w-100 p-3">
            <p class="m-0 text-center">
              <b>No Timeline Information</b>
              <br />
              <small className="text-muted">Visit Again Later</small>
            </p>
          </div>
        )}
        {getRequest.statusId === 3 && commentShow === false ? (
          <>
            <form
              onSubmit={(e) => {
                handleSubmitComment(e);
              }}
              encType="multipart/form-data"
            >
              <h5 className="mb-3 mt-3">Reply</h5>
              {/* <Editor
                editorState={editorValue}
                wrapperClassName="border border-dark"
                editorClassName="editorClassName pl-2 pr-2"
                placeholder="Enter comment"
                onEditorStateChange={handleChangeComment}
                toolbar={{
                  options: [
                    'inline',
                    'blockType',
                    'fontSize',
                    'fontFamily',
                    'list',
                    'textAlign',
                    'colorPicker',
                    'link',
                    'history',
                  ],
                }}
              /> */}
              <textarea
                name="comment"
                id="comment"
                rows="5"
                cols="132"
                onChange={handleCommentPost}
                style={{ resize: 'none', fontSize: '18px' }}
              ></textarea>
              <Form.Group>
                <h5 class="mb-3 mt-3">File Upload</h5>
                <CustomDropzone selectFiles={setWorkflowFiles} />
              </Form.Group>
              <div class="btn-toolbar">
                <input
                  type="submit"
                  name="proceedForm"
                  className="btn btn-custom"
                  value="SUBMIT"
                  disabled={!validateForm()}
                />
              </div>
            </form>
          </>
        ) : getRequest.statusId === 4 || getRequest.statusId === 5 || getRequest.statusId === 6 ? null : (
          <>
            <form
              onSubmit={(e) => {
                handleSubmitComment(e, 'commentOnly');
              }}
              encType="multipart/form-data"
            >
              <h5 className="mb-3 mt-3">Reply</h5>
              {/* <Editor
                editorState={editorValue}
                wrapperClassName="border border-dark"
                editorClassName="editorClassName pl-2 pr-2"
                placeholder="Enter comment"
                onEditorStateChange={handleChangeComment}
                toolbar={{
                  options: [
                    'inline',
                    'blockType',
                    'fontSize',
                    'fontFamily',
                    'list',
                    'textAlign',
                    'colorPicker',
                    'link',
                    'history',
                  ],
                }}
              /> */}
              <textarea
                name="comment"
                id="comment"
                rows="5"
                cols="132"
                onChange={handleCommentPost}
                style={{ resize: 'none', fontSize: '18px' }}
              ></textarea>
              <h5 class="mb-3 mt-3">File Upload</h5>
              <Form.Group className=" bg-light p-2 border-dark ">
                <div className=" h-50 opacity-50">
                  <CustomDropzone onFileRemove={handleFileRemove} onDrop={handleFileDrop} selectFiles={workflowFiles} />
                </div>
              </Form.Group>
              <div class="btn-toolbar">
                <input
                  type="submit"
                  name="proceedForm"
                  className="btn btn-custom"
                  value="SUBMIT"
                  disabled={!validateForm()}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default RequestDetails;