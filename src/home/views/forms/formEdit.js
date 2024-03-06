import React, { useEffect, useState } from 'react';
import { createRequest, getFormsByRequestKey, updateRequest } from '../request/api/request';
import { toast } from 'react-toastify';
import query from 'querystring';
import A from '../../../config/url';
import metaRoutes from '../../../config/meta_routes';
import FormBuilder from 'drag-and-drop-form-builder-2';
import HTMLFormRender from './components/HTMLFormRender';
import { getFormData } from '../../../config/form';
import status from '../request/constants';
import { useSelector } from 'react-redux';
import { getDraftFormsByRequestKey, editDraftRequest } from '../request/api/draftRequest';
import toastConst from '../../../constants/toast';
import { getDbBranch } from './api/form';
import { getDraftRequestById } from '../request/api/draftRequest';
import { Link } from 'react-router-dom';
import { exit } from 'process';
import { Modal, ModalBody } from 'react-bootstrap';
import CustomLoadingOverlay from '../../../components/CustomLoadingOverlay';
import { addComments } from '../request/api/workFlowLogs';

const FormEdit = (props) => {
  const qs = query.parse(props.location.search);
  const key = A.getId(qs['?i']);
  const type = qs.type;
  const [getRequest, setGetRequest] = useState();
  const [submitType, setSubmitType] = useState();
  const [selectedFiles, setSelectedFiles] = useState({});
  const userToken = useSelector((state) => state.user?.token);
  const populateURL = process.env.REACT_APP_POPULATE_URL;
  const [branchSelected, setBranchSelected] = useState(qs.branch || null);
  const [branchList, setBranchList] = useState([]);
  const [draftBranchDetails, setDraftBranchDetails] = useState('');
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  let timer;
  const [visible, setVisible] = useState(false);
  const [comment, setComment] = useState({});

  const getBranch = () => {
    getDbBranch((err, data) => {
      if (err) {
        toast.error('Error retrieving Branches!');
      } else {
        setBranchList(data.data);
      }
    });
  };
  const handleClose = () => {
    setConfirmationModal(false);
  };
  useEffect(() => {
    fetchForm();
    getBranch();
  }, [isLoading]); //eslint-disable-line
  const fetchForm = () => {
    if (type === 'draft') {
      getDraftFormsByRequestKey(key, (data, err) => {
        if (err) {
          props.history.push(metaRoutes.home);
          toast.error('Failed to get form.', toastConst.error);
        } else {
          setGetRequest(data);
        }
      });
    } else {
      getFormsByRequestKey(key, (data, err) => {
        if (err) {
          props.history.push(metaRoutes.home);
          toast.error('Failed to get form.', toastConst.error);
        } else {
          setGetRequest(data);
          setComment({
            requestId: key,
            actionId: 11,
            comment: null,
            createdAt: null,
          });
        }
      });
    }
  };
  const handleSubmitComment = (submitType) => {
    // e.preventDefault();
    const formData = new FormData();
    formData.append('actionId', comment.actionId);
    formData.append('comment', comment.comment ? comment.comment : '<p></p>');
    formData.append('requestId', comment.requestId);
    formData.append('submitType', submitType);
    addComments(formData, (err, data) => {
      if (err) {
        toast.error(err.response.data.message ?? 'Error in submmiting comment.', toastConst.error);
      }
    });
  };
  const handleCommentPost = (e) => {
    setComment({ ...comment, comment: e.target.value });
  };

  const getFileList = (formData, files = null) => {
    const fileList = [];
    let uploadedFiles;
    if (!files) {
      uploadedFiles = selectedFiles;
    } else {
      uploadedFiles = files;
    }
    for (const fieldName in uploadedFiles) {
      const f = uploadedFiles[fieldName].files;
      for (const file in f) {
        if (f.hasOwnProperty(file)) {
          formData.append(fieldName, f[file]);
        }
      }
      fileList.push({
        label: uploadedFiles[fieldName].label,
        fieldName: uploadedFiles[fieldName].name,
      });
    }
    return fileList;
  };
  /**
   * Handles selection of files from form builder.
   *
   * @param e
   * @param props
   */
  const formbuilderFileSelectHandler = (e, props) => {
    if (e && e.target && e.target.files && e.target.files.length > 0) {
      const fieldName = props.data.field_name;
      const label = props.data.label;
      addToSelectedFiles(fieldName, label, e.target.files);
    }
  };

  /**
   * Adds the provided parameters to state [selectedFiles].
   *
   * @param name
   * @param label
   * @param files
   */
  const addToSelectedFiles = (name, label, files) => {
    const file = {};
    file[name] = {
      name,
      label,
      files,
    };
    setSelectedFiles({
      ...selectedFiles,
      ...file,
    });
  };
  const prepareRequestValues = (event) => {
    let requestValues = {
      data: [],
      files: {},
    };
    let form = event.target;
    for (let i = 0; i < form.length; i++) {
      const element = form.elements[i];
      const name = element.name;
      const value = element.value;
      const type = element.type;
      const label = element.dataset.label;
      let data = {
        name,
        label,
      };
      switch (type) {
        case 'file':
          const file = {};
          file[name] = {
            name,
            label,
            files: element.files,
          };
          requestValues.files = {
            ...requestValues.files,
            ...file,
          };
          data.value = '';
          break;
        case 'checkbox':
          data.value = element.checked ? element.checked : false;
          break;
        case 'radio':
          const els = document.getElementsByName(name);
          els.forEach((e) => {
            if (e.checked) {
              data.value = e.value;
            }
          });
          break;
        default:
          data.value = value ? value : '';
      }
      // Prevents adding submit fields into request values.
      if (type !== 'submit') {
        requestValues['data'].push(data);
      }
    }
    return requestValues;
  };
  const filterUniqueObjects = (haystack) => {
    let names = [];
    return haystack.filter((item) => {
      if (names.includes(item.name)) {
        return false;
      }
      names.push(item.name);
      return true;
    });
  };

  /**
   * Gets the list of files and appends files to form data
   * from the state [selectedFiles].
   *
   * @param formData
   * @param files
   * @returns {[]}
   */
  const onSubmitHTML = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const requestValues = prepareRequestValues(e);
    const data = filterUniqueObjects(requestValues['data']);
    const files = requestValues['files'];
    setReviewData({ data, type: 'html', files });
    setConfirmationModal(true);
  };

  const formbuilderDraftHandler = (data) => {
    const requestData = {
      id: getRequest ? getRequest.id : null,
      formId: getRequest ? getRequest.form.id || getRequest.formId : null,
      statusId: getRequest && getRequest.statusId === status.returned ? status.pending : getRequest.statusId,
      isDraft: false,
      requestValues: JSON.stringify(data),
    };
    editRequestData(requestData);
  };

  const formbuilderSubmitHandler = (data) => {
    setVisible(true);
    const requestData = {
      id: getRequest ? getRequest.id : null,
      formId: getRequest ? getRequest.form.id || getRequest.formId : null,
      statusId: status.pending,
      isDraft: false,
      isDynamic: true,
      requestValues: JSON.stringify(data),
    };
    editRequestData(requestData);
  };
  const editRequestData = (requestData, files = null) => {
    // getFileList(requestData, files);
    // Checks if the user clicks Save as Draft button.
    if (requestData.statusId === status.drafts) {
      editDraftRequest(requestData, (err) => {
        if (!err) {
          clearTimeout(timer);
          setVisible(false);
          props.history.push(metaRoutes.requestHistory);
          toast.success('Draft Update Success!', toastConst.success);
        } else {
          setVisible(false);
          props.history.push(metaRoutes.requestHistory);
          toast.error('Error!', toastConst.error);
        }
      });
    } else {
      if (type === 'draft') {
        const formData = new FormData();
        for (const property in requestData) {
          formData.append(property, requestData[property]);
        }
        formData.append('fileList', JSON.stringify(getFileList(formData, files)));
        createRequest(formData, (err, json) => {
          if (err) {
            setVisible(false);
            toast.error(err.response.data.message, toastConst.error);
          } else {
            clearTimeout(timer);
            setVisible(false);
            toast.success(json.message);
            props.history.push(metaRoutes.requestHistory);
          }
        });
      } else {
        const formData = new FormData();
        for (const property in requestData) {
          formData.append(property, requestData[property]);
        }
        formData.append('fileList', JSON.stringify(getFileList(formData, files)));
        const id = requestData.id ? requestData.id : null;
        if (type === 're-submit') {
          createRequest(formData, (err) => {
            if (!err) {
              clearTimeout(timer);
              setVisible(false);
              props.history.push(metaRoutes.requestHistory);
              toast.success('Success! Re-Submitted your Request', toastConst.success);
            } else {
              setVisible(false);
              props.history.push(metaRoutes.requestHistory);
              toast.error('Error! Failed to Submit your Request', toastConst.error);
            }
          });
        } else {
          if (type === 'return' && getRequest.statusId && (comment?.comment == null || comment?.comment.length < 1)) {
            setIsLoading(false);
            clearTimeout(timer);
            setVisible(false);
            toast.error('Please provide comment.');
            return;
          }
          handleSubmitComment(type);
          updateRequest(id, formData, (err) => {
            if (!err) {
              clearTimeout(timer);
              setVisible(false);
              props.history.push(metaRoutes.requestHistory);
              toast.success('Success! Re-Submitted your Request', toastConst.success);
            } else {
              setVisible(false);
              props.history.push(metaRoutes.requestHistory);
              toast.error('Error! Failed to Submit your Request', toastConst.error);
            }
          });
        }
      }
    }
  };

  const confirmFormSubmit = (previewData) => {
    setVisible(true);
    if (branchSelected || getRequest?.requestedBranch || submitType === 'saveAsDraft') {
      const { data, files } = previewData;
      const requestData = {
        id: key,
        formId: getRequest ? getRequest.form.id : null,
        statusId: submitType === 'saveAsDraft' ? 5 : 1,
        isDraft: submitType === 'saveAsDraft',
        requestValues: JSON.stringify(data),
        requestedBranch: branchSelected || getRequest?.requestedBranch,
      };
      setIsLoading(true);
      timer = setTimeout(() => {
        setIsLoading(false);
        toast.error('Request Submission Failed. Please try again !', toastConst.error);
      }, 30000);
      editRequestData(requestData, files);
    } else {
      setVisible(false);
      toast.error('Please select your submission branch.', toastConst.error);
    }
  };
  const getDraftBranch = () => {
    var branchID;
    getDraftRequestById(key, (err, data) => {
      if (err) {
        props.history.push(metaRoutes.home);
        toast.error('Failed to get draft-request.', toastConst.error);
      }
      // console.log('data=>', data);
      setDraftBranchDetails(branchList.find((item) => item.sol == data.data.requestedBranch));
    });
  };
  if (type == 'draft') {
    getDraftBranch();
  }
  const getGuranteeTypeLabel = () => {
    return getRequest?.draft_request_values.find((gt) => gt.name == 'type_of_guarantee').value.slice(1, -1);
  };
  const checkBG = () => {
    return getRequest?.draft_request_values.find((gt) => gt.name == 'type_of_guarantee');
  };
  const checkBgForReturn = () => {
    return getRequest?.request_values.find((gt) => gt.name == 'type_of_guarantee');
  };
  const getGuranteeTypeLabelForReturn = () => {
    return getRequest?.request_values.find((gt) => gt.name == 'type_of_guarantee').value.slice(1, -1);
  };

  return (
    <>
      {isLoading === true ? (
        <div className="is-loading">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
        </div>
      ) : null}
      <Modal size="xl" show={confirmationModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="modal-title">Please Review the information provided.</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="inner-content-border h-100">
            <div className="vertical-tab-body">
              <div className="tab-content">
                <div className="tab-cnt-single">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-title plr-30"></div>
                    </div>
                  </div>
                  <div className="inner-item-box">
                    <div className="row">
                      <div className="col-12">
                        <div className="react-form-builder-form">
                          <div className="body-overlay">
                            {reviewData && reviewData.type === 'html' ? (
                              <div>
                                <HTMLFormRender
                                  requestValues={reviewData.data}
                                  formData={getRequest.form ? getRequest.form.formData : []}
                                  preview={true}
                                  javascript={getRequest.form ? getRequest.form.javascript : ''}
                                  requestFiles={reviewData.files || []}
                                />
                              </div>
                            ) : (
                              <FormBuilder.ReactFormGenerator
                                answer_data={
                                  reviewData && reviewData.data
                                    ? reviewData.data.map((reqVal) => ({
                                        id: reqVal.id,
                                        name: reqVal.name,
                                        value: reqVal.value,
                                      }))
                                    : 'N/A'
                                }
                                data={getRequest?.form ? getRequest.form.formData : []}
                                hide_actions
                                read_only
                                accessToken={userToken.accessToken}
                                autoPopulateUrl={populateURL}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {getRequest?.statusId == 3 || getRequest?.statusId == 1 ? (
            <div>
              <h5 className="mb-3 mt-3">Reply</h5>
              <textarea
                name="comment"
                id="comment"
                rows="5"
                cols="132"
                onChange={handleCommentPost}
                style={{ resize: 'none', fontSize: '18px' }}
              ></textarea>
            </div>
          ) : null}
          {getRequest && !getRequest?.requestedBranch ? (
            <>
              <label className="mt-2">Please select a Branch: </label>
              <select
                value={branchSelected}
                onChange={(e) => {
                  setBranchSelected(e.target.value);
                  // console.log(e.target.value)
                }}
                className="form-control"
              >
                <option>Please Select Branch</option>
                {branchList && branchList?.map((key) => <option value={key.sol}>{key.name}</option>)}
              </select>
            </>
          ) : (
            <>
              <label className="mt-2">Selected Branch: </label>
              <select defaultValue={getRequest?.requestedBranch || null} className="form-control" disabled>
                {branchList &&
                  branchList?.map((key) => (
                    <option value={key.sol}>
                      {key.name}({key.sol})
                    </option>
                  ))}
              </select>
            </>
          )}
          <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <CustomLoadingOverlay isLoading={visible}>
              <button
                style={{
                  background: 'linear-gradient(to right,#456185 0%,#c4151c 100%)',
                  textTransform: 'uppercase',
                  color: '#ffff',
                  border: '3px solid #fff',
                  padding: '14px 35px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onClick={() => confirmFormSubmit(reviewData)}
              >
                {submitType == 'submit' ? 'Proceed To Bank' : 'Save as Draft'}
              </button>
            </CustomLoadingOverlay>

            <button
              style={{
                background: 'linear-gradient(to right,#456185 0%,#c4151c 100%)',
                textTransform: 'uppercase',
                color: '#ffff',
                border: '3px solid #fff',
                padding: '14px 35px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={() => setConfirmationModal(false)}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <div className="container content-section">
        <h6 className="page-title clearfix">
          Please Fill The Form
          <div className="float-right">
            <Link
              to={{
                pathname: metaRoutes.RequestDetails,
                search: '?i=' + A.getHash(key) + (getRequest && getRequest.statusId == 5 ? '&&' + '?s=' + 5 : ''),
              }}
            >
              <button type="button" className="btn text-dark btn-light btn-sm mr-1">
                <i className="fa fa-chevron-left text-danger"></i> Go Back
              </button>
            </Link>
          </div>
          {type == 'draft' && (
            <>
              <div>
                BRANCH: {draftBranchDetails && draftBranchDetails.name}({draftBranchDetails && draftBranchDetails.sol}){' '}
              </div>
              {checkBG() && <div>GUARANTEE TYPE: {getGuranteeTypeLabel()}</div>}
            </>
          )}
          {(type == 'return' || type == 're-submit') && (
            <>
              <div>
                BRANCH:{branchList?.find((itm) => itm.sol == getRequest?.requestedBranch)?.name}(
                {getRequest?.requestedBranch})
              </div>
              {checkBgForReturn() && <div>GUARANTEE TYPE:{getGuranteeTypeLabelForReturn()}</div>}
            </>
          )}
        </h6>
        <div className="col-md-12 pl-md-0">
          <div className="inner-content-border h-100">
            <div className="vertical-tab-body">
              <div className="tab-content">
                <div className="tab-cnt-single">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-title plr-30">
                        <h3>Name : {getRequest ? getRequest.form.name : ''}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="inner-item-box">
                    <div className="row">
                      <div className="col-12">
                        <div className="react-form-builder-form">
                          {getRequest && getRequest.form.type === 'html' ? (
                            <form onSubmit={onSubmitHTML} encType="multipart/form-data">
                              <HTMLFormRender
                                requestValues={getRequest?.request_values || getRequest?.draft_request_values}
                                formData={getRequest.form ? getRequest.form.formData : []}
                                javascript={getRequest.form ? getRequest.form.javascript : ''}
                              />

                              <input
                                type="submit"
                                name="submit"
                                className="btn btn-custom "
                                onClick={(e) => {
                                  setSubmitType(e.target.name);
                                }}
                                value="Proceed To Bank"
                              />

                              {type === 'draft' ? (
                                <input
                                  type="submit"
                                  name="saveAsDraft"
                                  formNoValidate
                                  className="btn btn-custom"
                                  onClick={(e) => {
                                    setSubmitType(e.target.name);
                                  }}
                                  value="Update"
                                />
                              ) : null}
                            </form>
                          ) : null}

                          {getRequest && getRequest.form.type === 'dynamic' ? (
                            <>
                              <FormBuilder.ReactFormGenerator
                                action_name="Submit Request"
                                accessToken={userToken.accessToken}
                                autoPopulateUrl={populateURL}
                                draft_action_name={getRequest && getRequest.statusId == 5 ? 'Update Draft' : null}
                                onSubmit={formbuilderSubmitHandler}
                                onFileSelect={formbuilderFileSelectHandler}
                                onSaveDraft={getRequest && getRequest.statusId == 5 ? formbuilderDraftHandler : null}
                                answer_data={
                                  getRequest && getRequest.request_values
                                    ? getRequest.request_values.map((reqVal) => ({
                                        id: reqVal.id,
                                        name: reqVal.name,
                                        value: JSON.parse(reqVal.value),
                                      }))
                                    : getRequest && getRequest.draft_request_values
                                    ? getRequest.draft_request_values.map((reqVal) => ({
                                        id: reqVal.id,
                                        name: reqVal.name,
                                        value: JSON.parse(reqVal.value),
                                      }))
                                    : []
                                }
                                data={JSON.parse(getRequest.form.formData || '{}')}
                              />
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
      </div>
    </>
  );
};

export default FormEdit;
