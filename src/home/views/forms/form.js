import React, { useEffect, useState } from 'react';
import { getFormById, getBranchLists, getDbBranch, getGeneralFormById } from './api/form';
// import { getFormData } from "../../../config/form";
import A from '../../../config/url';
import { toast } from 'react-toastify';
import HTMLFormRender from './components/HTMLFormRender';
import query from 'querystring';
import { CLIENT_USER } from '../../../config/values';
import FormBuilder from 'drag-and-drop-form-builder-2';
import metaRoutes from '../../../config/meta_routes';
import { createRequest, createRequestToCCMS, createGeneralRequest } from '../request/api/request';
import { useDispatch, useSelector } from 'react-redux';
import { addRedirectUrl, logout } from '../../../redux/user/userSlice';
import { isEmpty } from 'lodash';
import RequestStatus from '../../../constants/request';
import { saveDraft } from '../request/api/draftRequest';
import axios from 'axios';
import Select from 'react-select';
import toastConst from '../../../constants/toast';
import parse from 'html-react-parser';
import { Link } from 'react-router-dom';
import { Modal, Table, ModalBody } from 'react-bootstrap';
import CustomLoadingOverlay from '../../../components/CustomLoadingOverlay';

const Form = (props) => {
  const [getFormField, setGetFormField] = useState(false);
  const [getForm, setGetForm] = useState([]);
  const [isMounted, setMounted] = useState(false);
  const [formData, setFormData] = useState([]);
  const [css, setCss] = useState([]);
  const [javascript, setJavascript] = useState([]);
  const [submitType, setSubmitType] = useState();
  const [selectedFiles, setSelectedFiles] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState();
  const [tac, setTAC] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [modelShow, setModelShow] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [branchList, setBranchList] = useState([]);
  const qs = query.parse(props.location.search);
  const id = A.getId(qs['?i']);
  // const test = qs['?e'];
  const [branchSelected, setBranchSelected] = useState(qs.branch || null);
  const [branchSelectedPreview, setBranchSelectedPreview] = useState(null);
  const userInfo = useSelector((state) => state.user?.userInfo);
  const userToken = useSelector((state) => state.user?.token);
  const dispatch = useDispatch();
  const [getFormFees, setFormFees] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [validUser, setValidUser] = useState(true);
  const [formName, setFormName] = useState('');
  let timer;
  const [visible, setVisible] = useState(false);
  const mystyle = {
    border: '16px solid #f3f3f3' /* Light grey */,
    borderTop: '16px solid #3498db' /* Blue */,
    borderRadius: '50%',
    width: '120px',
    height: '120px',
    animation: 'spin 10s linear infinite',
  };
  const populateURL = process.env.REACT_APP_POPULATE_URL;

  const handleClose = () => {
    setModelShow(false);
    setConfirmationModal(false);
  };
  const getBranch = () => {
    getDbBranch((err, data) => {
      if (err) {
        toast.error('Error retrieving Branches!');
      } else {
        setBranchList(data.data);
      }
    });
  };

  const getGeneraFormType = async () => {
    let result = '';
    const formId = id;
    if (formId !== null) {
      await getGeneralFormById(formId).then(async (data) => {
        if (!data) return;
        result = data?.data?.formCategory;
      });
      return result;
    } else {
      toast.error('Error!', toastConst.error);
    }
  };
  const getGeneralData = async () => {
    setGetFormField(true);
    let result = '';
    const formId = id;
    if (formId !== null) {
      await getGeneralFormById(formId).then(async (data) => {
        if (!data) return;
        setMessage(data && data.message ? data.message : null);
        const formOutput = data.data;
        const toc = formOutput && formOutput?.TACtype ? '' : setTAC(true);
        if (formOutput?.formFees) {
          var pattern = new RegExp(
            '^(https?:\\/\\/)?' + // protocol
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
              '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
              '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
              '(\\#[-a-z\\d_]*)?$',
            'i'
          ); // fragment locator

          if (!!pattern.test(formOutput?.formFees)) {
            await axios.get(formOutput?.formFees).then((res) => {
              const fees = res?.data;
              setFormFees(fees.value);
            });
          } else if (!isNaN(formOutput?.formFees)) {
            setFormFees(formOutput?.formFees);
          }
        }
        setMounted(true);
        switch (formOutput?.type) {
          case 'html':
            setGetForm(formOutput);
            setFormData(formOutput?.formData);
            setCss(formOutput?.css);
            setJavascript(formOutput?.javascript);
            break;
          case 'dynamic':
            setGetForm(formOutput);
            setFormData(JSON.parse(formOutput?.formData));
            break;
          default:
            // toast.warn('Error occurred!==', toastConst.warn);
            break;
        }
      });
    } else {
      toast.error('Error!', toastConst.error);
    }
  };

  useEffect(() => {
    (async function () {
      const formCategoryType = await getGeneraFormType();
      setFormCategoryId(formCategoryType);
      if (userInfo && userInfo?.customerType == 'RETAIL' && (id != 3 || id != 1)) {
        getData();
        // props.history.push('/');
      }
      if (userInfo && userInfo?.customerType == 'RETAIL' && (id == 3 || id == 1)) {
        props.history.push('/');
      }
      await getBranch();
      const redirectUrl = props.history.location.pathname + props.history.location.search;
      if (formCategoryType != 'General') {
        if (userInfo) {
          getData();
        } else {
          getGeneralData();
          dispatch(addRedirectUrl(redirectUrl));
          toast.info('Please login to proceed', toastConst.info);
          props.history.push(metaRoutes.login);
        }
      } else {
        getGeneralData();
      }
    })();
  }, [userInfo, userToken, isLoading, formCategoryId]); //eslint-disable-line

  const getData = () => {
    setGetFormField(true);
    const formId = id;
    if (formId !== null) {
      getFormById(formId, (err, data) => {
        if (err) return;
        setFormName(data?.data?.name || '');
        setMessage(data && data.message ? data.message : null);
        const formOutput = data.data;
        const toc = formOutput && formOutput.TACtype ? '' : setTAC(true);
        if (formOutput?.formFees) {
          var pattern = new RegExp(
            '^(https?:\\/\\/)?' + // protocol
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
              '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
              '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
              '(\\#[-a-z\\d_]*)?$',
            'i'
          ); // fragment locator

          if (!!pattern.test(formOutput?.formFees)) {
            axios.get(formOutput?.formFees).then((res) => {
              const fees = res.data;
              setFormFees(fees.value);
            });
          } else if (!isNaN(formOutput.formFees)) {
            setFormFees(formOutput.formFees);
          }
        }

        setMounted(true);
        switch (formOutput.type) {
          case 'html':
            setGetForm(formOutput);
            setFormData(formOutput.formData);
            setCss(formOutput.css);
            setJavascript(formOutput.javascript);
            break;
          case 'dynamic':
            setGetForm(formOutput);
            setFormData(JSON.parse(formOutput.formData));
            break;
          default:
            // toast.warn('Error occurred!', toastConst.warn);
            break;
        }
      });
    } else {
      toast.error('Error!', toastConst.error);
    }
  };
  const onTAChandleClick = (e) => {
    let value;
    if (e.target.value === 'false') {
      value = true;
    } else {
      setSubmitType('');
      value = false;
      setMessage('');
    }
    const isActive = value;
    setTAC(isActive);
  };
  /**
   * Handles submission of requests from dynamic forms.
   *
   * @param data
   */
  const formbuilderSubmitHandler = (data) => {
    // setReviewData({ data, type: 'dynamic' });
    // setConfirmationModal(true);
    submitDynamicForm(data);
  };

  /**
   * Handles submission of drafts from dynamic forms.
   *
   * @param data
   */
  const formbuilderDraftHandler = (data) => {
    submitDynamicForm(data, true);
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

  /**
   * Gets the list of fgiles and appends files to form data
   * from the state [selectedFiles].
   *
   * @param formData
   * @param files
   * @returns {[]}
   */
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

  const confirmFormSubmit = (previewData) => {
    //checkout module here
    // let url = 'https://dev-merchant.swifttech.com.np/';
    // merchantLogin();
    // window.open(url, '_blank');
    setVisible(true);
    if (formCategoryId != 'General') {
      if (branchSelected || submitType === 'saveAsDraft' || branchSelectedPreview) {
        setIsLoading(true);
        timer = setTimeout(() => {
          setIsLoading(false);
          toast.error('Request Submission Failed. Please try again !', toastConst.error);
        }, 30000);
        if (previewData.type == 'html') {
          submit(previewData.data, previewData.files, false, submitType === 'saveAsDraft');
        } else {
          submitDynamicForm(previewData.data);
        }
      } else {
        toast.error('Please select your submission branch.', toastConst.error);
        setVisible(false);
      }
    } else {
      if (branchSelected || branchSelectedPreview) {
        submit(previewData.data, previewData.files, false, submitType === '');
      } else {
        toast.error('Please select your submission branch.', toastConst.error);
        setVisible(false);
      }
    }
  };
  /**
   * Calls submit method with parameters related to
   * dynamic form.
   *
   * @param data
   * @param isDraft
   */
  const submitDynamicForm = (data, isDraft = false) => {
    submit(data, null, true, isDraft);
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
   * Prepares the request values from the html forms
   * in the format of the dynamic form.
   *
   * @param event
   * @returns {{data: [], files: {}}}
   */
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

  /**
   * Calls the submit method with parameters related to
   * HTML form.
   *
   * @param e
   */
  const submitFormHTML = (e) => {
    e.preventDefault();
    const requestValues = prepareRequestValues(e);
    const data = filterUniqueObjects(requestValues['data']);
    const files = requestValues['files'];

    if (getForm && getForm.enablePreview) {
      setReviewData({ data, type: 'html', files });
      if (tac) {
        setConfirmationModal(true);
        setMessage('');
      } else {
        setConfirmationModal(false);
        setMessage('please tick terms and condition');
      }
    } else {
      submit(data, files, false);
      if (tac) {
        setMessage('');
      } else {
        setMessage('please tick terms and condition');
      }
    }
  };

  /**
   * Handles the submission of forms.
   *
   * @param data
   * @param files
   * @param isDynamic
   * @param isDraft
   */
  const submit = async (data, files = null, isDynamic, isDraft) => {
    // if (getForm.formCategory && getForm.formCategory == 'Financial') {
    //   merchantLogin();
    // }
    let requestData;
    requestData = {
      formId: getForm.id,
      formName: getForm.name,
      isDraft: isDraft,
      isDynamic: isDynamic,
      ccmsUrl: getForm.ccmsUrl || '',
      requestedBranch: branchSelectedPreview ? branchSelectedPreview : branchSelected || '',
    };
    requestData.statusId = isDraft ? RequestStatus.drafts : RequestStatus.pending;
    const formData = new FormData();
    for (const property in requestData) {
      formData.append(property, requestData[property]);
    }
    formData.append('requestValues', JSON.stringify(data));
    formData.append('fileList', JSON.stringify(getFileList(formData, files)));
    const cb = (err, response) => {
      if (err) {
        clearTimeout(timer);
        if (err.response?.status && err.response.status === 412) {
          setValidationErrors(err.response.data.data);
        }
        toast.error(
          err.response?.data?.message ? err.response.data.message : 'Failed to submit request. Please try again later.',
          toastConst.error
        );
        setVisible(false);
      } else {
        clearTimeout(timer);
        toast.success(response.message, toastConst.success);
        props.history.push(metaRoutes.requestHistory);
      }
    };
    if (isDraft) {
      clearTimeout(timer);
      saveDraft(formData, cb);
    } else {
      if (tac) {
        if (getForm && getForm.ccmsUrl) {
          const requestToCCMS = await createRequestToCCMS(formData);
          if (requestToCCMS.data.status === 'Success') {
            formData.append('requestIdccms', data?.data?.requestId);
            await createRequest(formData, cb);
            toast.success(data.message);
          } else {
            toast.error(requestToCCMS.data.message, toastConst.error);
          }
        } else {
          if (formCategoryId != 'General') {
            createRequest(formData, cb);
            props.history.push('/home');
          } else {
            createGeneralRequest(formData, cb);
            return;
          }
        }
      } else {
        setMessage('please tick terms and condition');
      }
    }
  };
  const findBranchLabel = (branch) => {
    const labelBranch = branchList.find((data) => data.sol == branch);
    return `${labelBranch?.name}(${labelBranch?.sol})`;
  };
  const findBranchLabelName = (branch) => {
    const labelBranch = branchList.find((data) => data.sol == branch);
    return `${labelBranch?.name}`;
  };
  const options = branchList.map(function (branch) {
    return { value: branch.sol, label: branch.name + ' (' + branch.sol + ')' };
  });
  // if(test ==='tst' && !formData.testEnabled ){
  //   return <h1>Form is Expired.</h1>
  // }

  const generateDVH = (requestObj, secretKey) => {
    try {
      let dvhString = Buffer.from(JSON.stringify(requestObj)).toString('base64');
      return crypto.createHmac(`SHA512`, secretKey).update(dvhString).digest('hex');
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const merchantLogin = async () => {
    // let loginURL = 'https://dev-merchant.swifttech.com.np/api/v1/merchant/auth/login';
    //Base URL: https://dev-merchant.swifttech.com.np
    //Generate DVH Key
    // API key and Secret key to be given by GBIME
    // Validate Token and DVH key from response of Global
    const referenceId = crypto.randomBytes(8).toString('hex');
    const secretKey = '2632e72564e54acd95565a4982a4e15c';
    const apiKey = '2fe93337-e835-4dc6-8f54-af9f4aaaf9dd';
    let tokenRequest = {
      apiKey,
      referenceId,
    };

    tokenRequest.dvh = generateDVH(tokenRequest, secretKey);
    const swiftToken = await requestSwiftToken(tokenRequest);
    console.log(swiftToken);
    if (!swiftToken) {
      return;
    }
    let newTokenRequest = {
      apiKey,
      callbackUrl: 'www.globalimebank.com.np',
      cancelUrl: 'http://localhost:3001/#/home', //url if process is cancelled or any error occured
      referenceId,
      returnUrl: 'www.globalimebank.com.np', //url if process is completed successfully
      token: swiftToken.data.data.token,
    };
    newTokenRequest.dvh = generateDVH(newTokenRequest, secretKey);
    const swiftVerification = await verifySwiftToken(newTokenRequest);
    console.log(swiftVerification, 'SSSSS====');
  };

  const requestSwiftToken = async (requestObj) => {
    let userVerifyURL = 'https://dev-merchant.swifttech.com.np/api/v1/merchant/verify-user/token';
    let result;
    await axios
      .post(
        userVerifyURL,
        {
          apiKey: requestObj.apiKey,
          purpose: 'validation',
          referenceId: requestObj.referenceId,
        },
        {
          headers: {
            DVH: requestObj.dvh,
          },
        }
      )
      .then((res) => {
        result = res;
      })
      .catch((err) => {
        result = false;
        console.log(err);
      });
    return result;
  };

  const verifySwiftToken = async (requestObj) => {
    let tokenVerifyURL = 'https://dev-merchant.swifttech.com.np/api/v1/merchant/verify-user/token/verify';
    let result;
    await axios
      .post(
        tokenVerifyURL,
        {
          apiKey: requestObj.apiKey,
          callbackUrl: requestObj.callbackUrl,
          cancelUrl: requestObj.cancelUrl,
          purpose: 'validation',
          referenceId: requestObj.referenceId,
          returnUrl: requestObj.returnUrl,
          token: requestObj.token,
        },
        {
          headers: {
            DVH: requestObj.dvh,
          },
        }
      )
      .then((res) => {
        // console.log(res.data, '-----------verifySwiftToken');
        window.location.href = res.data.data.webCheckoutUrl;
        result = res;
      })
      .catch((err) => {
        result = false;
        console.log(err);
      });
    return result;
  };

  return (
    <>
      {isLoading === true ? (
        <div className="is-loading">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
        </div>
      ) : null}

      <Modal size="xl" show={modelShow} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="modal-title">Terms & Conditions:</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{getForm.TAC ? <div dangerouslySetInnerHTML={{ __html: parse(getForm.TAC) }}></div> : ''}</Modal.Body>
      </Modal>
      <Modal size="xl" show={confirmationModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="modal-title">Please review the information provided</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container content-section">
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
                                    formData={formData ? formData : []}
                                    preview={true}
                                    javascript={javascript}
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
                                  data={formData}
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
            {getForm && !branchSelected ? (
              <>
                <label className="mt-2">Please select a Branch: </label>
                <Select
                  options={options}
                  onChange={(e) => {
                    setBranchSelectedPreview(e.value);
                  }}
                  placeholder="Please select Branch"
                />
              </>
            ) : null}
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
          </div>
        </Modal.Body>
      </Modal>

      <div className="content-section">
        <h6 className="page-title clearfix">
          <br />
          <small style={{ textTransform: 'capitalize' }}>Please Fill The Form</small>
          <span className="d-none user-account">{userInfo?.accountNumber}</span>
          <span className="d-none user-mobile">{userInfo?.mobileNumber}</span>
          <span className="d-none user-name">{userInfo?.accountName}</span>
          <div className="float-right">
            <Link
              to={{
                pathname: metaRoutes.formLists,
                search: '?i=' + A.getHash(getForm.categoryId),
              }}
            >
              <button type="button" className="btn text-dark btn-light btn-sm mr-1">
                <i className="fa fa-chevron-left text-danger"></i> Go Back
              </button>
            </Link>
          </div>
        </h6>
        {/* New Changes */}
        {branchSelected && (
          <p className="mb-2 d-inline-block mr-4">
            Applying for branch : <b>{findBranchLabel(branchSelected)}</b>
          </p>
        )}
        {qs.gt && (
          <p className="mb-2 d-inline-block">
            Applying for Guarantee Type : <b id="selectedGuaranteeType">{qs.gt}</b>
          </p>
        )}
        <span id="branch-name" className="d-none">
          {findBranchLabelName(branchSelected)}
        </span>
        {message ? (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        ) : null}
        <div className="inner-content-border h-100">
          <div className="vertical-tab-body">
            <div className="tab-content">
              <div className="tab-cnt-single">
                {getFormField === false ? (
                  <>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-title plr-30">
                          <h3>
                            <strong>NOTE:</strong>
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="inner-item-box">
                      <div className="row">
                        <div className="col-12">
                          <div className="react-form-builder-form">
                            <h1>Some Note Here</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="">
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="form-title plr-30">
                            <h3>{getForm.name}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="inner-item-box">
                        {!isEmpty(validationErrors) && (
                          <div className="row">
                            <div className="col-12">
                              <div className="alert alert-danger validation-error">
                                <ul className="validation-errors">
                                  {Object.keys(validationErrors).map((key) => {
                                    return <li>{validationErrors[key]}</li>;
                                  })}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="row">
                          <div className="col-12">
                            <div className="react-form-builder-form">
                              {getForm.type === 'html' ? (
                                <form onSubmit={submitFormHTML} encType="multipart/form-data">
                                  {
                                    <HTMLFormRender
                                      type={CLIENT_USER}
                                      formData={formData}
                                      css={css}
                                      javascript={javascript}
                                    />
                                  }

                                  <div className="btn-toolbar">
                                    {getForm.TACtype !== null ? (
                                      <div className="jumbotron mb-2 p-3 mt-0 d-block w-100">
                                        <div className="custom-control custom-checkbox">
                                          <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            checked={tac}
                                            onChange={onTAChandleClick}
                                            name={`other-services-switch`}
                                            value={tac}
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                            id="terms-condition"
                                          />
                                          <label className="custom-control-label" for="terms-condition">
                                            Terms & Conditions Apply.
                                          </label>
                                          {getForm.TACtype === 'url' ? (
                                            <a href={getForm.TAC} target="_blank" className="ml-2 text-primary">
                                              View
                                            </a>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                setModelShow(true);
                                              }}
                                              style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: 'blue',
                                              }}
                                              data-toggle="modal"
                                              data-target="#exampleModal"
                                            >
                                              Terms & Conditions Apply.
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : null}
                                    <input
                                      type="submit"
                                      name="submit"
                                      className="btn btn-custom"
                                      onClick={(e) => {
                                        setSubmitType(e.target.name);
                                      }}
                                      value="Submit"
                                    />
                                    {getForm && getForm.enablePreview && (
                                      <input
                                        type="submit"
                                        name="saveAsDraft"
                                        className="btn btn-custom ml-2"
                                        formNoValidate
                                        onClick={(e) => {
                                          setSubmitType(e.target.name);
                                        }}
                                        value="Save as draft"
                                      />
                                    )}
                                  </div>
                                </form>
                              ) : null}
                              {getForm.type === 'dynamic' ? (
                                <FormBuilder.ReactFormGenerator
                                  answer_data={[]}
                                  action_name="Submit"
                                  draft_action_name={getForm.enablePreview ? 'Save as Draft' : null}
                                  data={formData}
                                  onSubmit={formbuilderSubmitHandler}
                                  onSaveDraft={formbuilderDraftHandler}
                                  onFileSelect={formbuilderFileSelectHandler}
                                  accessToken={userToken.accessToken}
                                  toc={getForm && getForm.TACtype ? true : false}
                                  tocText={'Terms & Conditions'}
                                  tocButtonText={'View'}
                                  tocHandleChange={(e) => {
                                    var elem = document.getElementById('terms-condition');
                                    if (e.target.value === 'on') {
                                      setTAC(true);
                                      elem.value = false;
                                    } else if (e.target.value === 'false') {
                                      setTAC(false);
                                      elem.value = true;
                                    } else if (e.target.value === 'true') {
                                      setTAC(true);
                                      elem.value = false;
                                    }
                                  }}
                                  tocHandleView={(e) => {
                                    if (getForm.TACtype === 'url') {
                                      window.open(getForm.TAC, '_blank');
                                    } else {
                                      setModelShow(true);
                                    }
                                  }}
                                  autoPopulateUrl={populateURL}
                                />
                              ) : null}
                              {getFormFees ? (
                                <div className="jumbotron mt-3 p-3">
                                  <p className="mb-0">
                                    <b>Fees :</b> Rs. {getFormFees ? getFormFees : 0} /-
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Form;
