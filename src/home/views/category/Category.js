import React, { useEffect, useState } from 'react';
import { availableCategory, getCategories } from './api/category';
import { getDbBranch } from '../forms/api/form';
import A from '../../../config/url';
import metaRoutes from '../../../config/meta_routes';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addRedirectUrl } from '../../../redux/user/userSlice';
import { fetchUser } from '../../../redux/user/userSlice';
import toastConst from '../../../constants/toast';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { getForms } from '../forms/api/form';
import bannerImg from '../../../assets/images/customer-banner.png';
import Select from 'react-select';
const LC_Decentralized = process.env.LC_DECENTRALIZED_FORM_ID;

const Category = (props) => {
  const [categories, setCategories] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  const [bgBranch, setBgBranch] = useState({ branch: '', gt: '' });
  const [branchesList, setBranchesList] = useState([]);
  const [customForm, setCustomForm] = useState({});
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user?.userInfo);
  const [branch, setBranch] = useState(userInfo?.branchSol || '');
  const initialBranch = userInfo?.branchSol;
  const [userType, setUserType] = useState(userInfo?.customerType || '');
  const [retailCategory, setRetailCategory] = useState([]);
  const [corporateCategory, setCorporateCategory] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    const redirectUrl = props.history.location.pathname + props.history.location.search;
    getCategory();
    getOtherServices();
    dispatch(fetchUser());
    getBranch();
    if (userInfo) {
    } else {
      dispatch(addRedirectUrl(redirectUrl));
      // toast.info('Please login to proceed', toastConst.info);
      // props.history.push(metaRoutes.login);
    }
  }, [userInfo, dispatch]); //eslint-disable-line
  // const splitCategories = () => {
  //   // console.log('SPLIT CATEGORIES <=>', categories);
  //   // console.log('USER INFO <=>', userInfo);
  //   const filtered = categories?.filter((data) => data?.categoryType == userType);
  //   // setFilteredCategories(filtered);
  //   console.log('FILTERED CATEGORIES', filtered);
  // };

  const getBranch = () => {
    getDbBranch((err, data) => {
      if (err) {
        toast.error('Error retrieving Branches!');
      } else {
        setBranchesList(data.data);
      }
    });

    getForms((err, data) => {
      if (err) {
        toast.error('Error retrieving requested Form!');
      } else {
        if (data.data.length > 0) {
          const LC_Form_Dec = data.data.find((form) => form['name'] === 'LC Form Decentralized');
          const LC_Form_Cen = data.data.find((form) => form['name'] === 'LC Form Centralized');
          const BG_Form_Dec = data.data.find((form) => form['name'] === 'BG Form Decentralized');
          const BG_Form_Cen = data.data.find((form) => form['name'] === 'BG Form Centralized');

          const retrivedIDs = {
            LC_Dec: LC_Form_Dec?.id || '',
            LC_Cen: LC_Form_Cen?.id || '',
            BG_Dec: BG_Form_Dec?.id || '',
            BG_Cen: BG_Form_Cen?.id || '',
          };
          setCustomForm(retrivedIDs);
        }
      }
    });
  };

  const options = branchesList.map(function (branch) {
    return { value: branch.sol, label: branch.name + ' (' + branch.sol + ')' };
  });

  const guaranteeOptions = [
    { value: 'Bid Bond', label: 'Bid Bond' },
    { value: 'Performance Bond', label: 'Performance Bond' },
    { value: 'Advance Payment', label: 'Advance Payment' },
    { value: 'Supply Credit Guarantee', label: 'Supply Credit Guarantee' },
    { value: 'Line of Credit Commitment', label: 'Line of Credit Commitment' },
    { value: 'Custom Guarantee', label: 'Custom Guarantee' },
  ];
  const findGtValue = (val) => {
    return guaranteeOptions.find((data) => data.value == val).label;
  };

  const getCategory = () => {
    availableCategory((err, data) => {
      if (err) toast.error('Error!');
      else {
        // let dummy = data.data.filter((dta) => dta?.categoryType == userType);
        // console.log('DUMMY', dummy);
        setCategories(data.data);
        setFilteredCategories(data.data.filter((dta) => dta?.categoryType == userType));
      }
    });
  };
  const getOtherServices = () => {
    getCategories((err, data) => {
      if (err) toast.error('Error!');
      else setOtherServices(data.data);
    });
  };
  const openModal = () => {
    setModalOpen(!modalOpen);
    setBranch(userInfo?.branchSol || '');
  };
  const openBgModal = () => {
    setBgModalOpen(!bgModalOpen);
    setBgBranch({ branch: userInfo?.branchSol || '' });
  };

  // Static forms id for two LC form 15 & 16
  const openLC = () => {
    if (branch) {
      if (customForm.LC_Dec && branchesList.some((b) => b['sol'] == branch && b['lc_decentralized'] == true)) {
        props.history.push(metaRoutes.form + '?i=' + A.getHash(customForm.LC_Dec) + '&branch=' + branch);
      } else if (customForm.LC_Cen && branchesList.some((b) => b['sol'] == branch)) {
        props.history.push(metaRoutes.form + '?i=' + A.getHash(customForm.LC_Cen) + '&branch=' + branch);
      } else {
        toast.info('Selected form can not be retrieved');
      }
    }
  };

  // Static forms id for two LC form 15 & 16
  const openBG = () => {
    if (bgBranch.branch && bgBranch.gt) {
      if (
        customForm.BG_Dec &&
        branchesList.some(
          (b) =>
            b['sol'] == bgBranch.branch &&
            b['bg_decentralized'] == true &&
            (b['bg_type'] == bgBranch.gt || b['bg_type'] == null)
        )
      ) {
        props.history.push(
          metaRoutes.form +
            '?i=' +
            A.getHash(customForm.BG_Dec) +
            '&branch=' +
            bgBranch.branch +
            '&gt=' +
            findGtValue(bgBranch.gt)
        );
      } else if (customForm.BG_Cen && branchesList.some((b) => b['sol'] == bgBranch.branch)) {
        props.history.push(
          metaRoutes.form +
            '?i=' +
            A.getHash(customForm.BG_Cen) +
            '&branch=' +
            bgBranch.branch +
            '&gt=' +
            findGtValue(bgBranch.gt)
        );
      } else {
        toast.info('Selected form can not be retrieved');
      }
    }
  };
  const findBranchLabel = (branch) => {
    if (branch) {
      const labelBranch = branchesList.find((data) => data.sol == branch);
      return `${labelBranch?.name}(${labelBranch?.sol})`;
    }
    return '';
  };

  return (
    <div className="content-section">
      {/* {userInfo && userInfo.accountNumber ? null : (
        <div className="welcome-note">
          <h1 className="text-center text-light">
            Welcome to <br />
            <b>Business</b> Service
          </h1>
        </div>
      )} */}

      <img src={bannerImg} className="img-fluid mb-4" />

      {/* Static branch list for LC */}
      <Modal isOpen={modalOpen} toggle={openModal}>
        <ModalHeader toggle={openModal}>Select Branch</ModalHeader>
        <ModalBody>
          <Select
            // value={branch}
            defaultValue={{ label: findBranchLabel(branch), value: branch }}
            options={options}
            onChange={(e) => {
              setBranch(e.value);
            }}
            placeholder="Please Select Branch"
          />
          {branch && initialBranch !== branch ? (
            <small className="text-center w-100 mt-2 d-block" style={{ color: 'red' }}>
              Different branch selected, do you want to submit?
            </small>
          ) : (
            ''
          )}
          <div className="mt-3 d-flex justify-content-center">
            <button type="button" className="btn btn-custom btn-block" onClick={openLC}>
              Submit
            </button>
          </div>
        </ModalBody>
      </Modal>
      {/* UPTO here: Static branch list for LC */}

      {/* Static branch list for BG */}
      <Modal isOpen={bgModalOpen} toggle={openBgModal}>
        <ModalHeader toggle={openBgModal}>Select Branch & Guarantee Type</ModalHeader>
        <ModalBody>
          <Select
            defaultValue={{ label: findBranchLabel(branch), value: branch }}
            options={options}
            className="mb-2"
            onChange={(e) => {
              setBgBranch({ ...bgBranch, branch: e.value });
              setBranch(e.value);
            }}
            placeholder="Please Select Branch"
          />
          {branch && initialBranch !== branch ? (
            <small className="text-center w-100 mt-2 d-block" style={{ color: 'red' }}>
              Different branch selected, do you want to submit?
            </small>
          ) : (
            ''
          )}
          <Select
            options={guaranteeOptions}
            className="mb-2"
            onChange={(e) => {
              setBgBranch({ ...bgBranch, gt: e.value });
            }}
            placeholder="Please Select Guarantee Type"
          />
          <div className="mt-3 d-flex justify-content-center">
            <button type="button" className="btn btn-custom btn-block" onClick={openBG}>
              Submit
            </button>
          </div>
        </ModalBody>
      </Modal>
      {/* UPTO here: Static branch list for BG */}
      <div className="row">
        {/* {console.log('userInfo', userInfo)}
        {console.log('CATEGORIES=>', categories)} */}
        {!userInfo &&
          categories.map(
            (category, index) =>
              category.isActive && (
                <div className=" col-6 col-sm-4 col-md-3" key={index}>
                  <Link
                    to={metaRoutes.formLists + '?i=' + A.getHash(category.id) + '&&' + '?s=' + category.name}
                    className="content-item category-list"
                  >
                    <img src={process.env.PUBLIC_URL + './images/icons/' + category.iconFile} alt="" />
                    <h2>{category.name}</h2>
                  </Link>
                </div>
              )
          )}
        {userInfo &&
          filteredCategories.map(
            (category, index) =>
              category.isActive && (
                <div className=" col-6 col-sm-4 col-md-3" key={index}>
                  <Link
                    to={metaRoutes.formLists + '?i=' + A.getHash(category.id) + '&&' + '?s=' + category.name}
                    className="content-item category-list"
                  >
                    <img src={process.env.PUBLIC_URL + './images/icons/' + category.iconFile} alt="" />
                    <h2>{category.name}</h2>
                  </Link>
                </div>
              )
          )}

        {/* {(userType == 'CORPORATE' || !userInfo) && ( */}
        <>
          {/* for Static LC category and form */}
          {(userType == 'CORPORATE' || !userInfo) && (
            <div className=" col-6 col-sm-4 col-md-3">
              <div className="content-item category-list" onClick={openModal}>
                <img src={process.env.PUBLIC_URL + './images/icons/lc_icon.png'} alt="" />
                <h2>LC Issuance</h2>
              </div>
            </div>
          )}
          {/* UPTO here: for Static LC category and form */}

          {/* for Static BG category and form */}
          <div className=" col-6 col-sm-4 col-md-3">
            <div className="content-item category-list" onClick={openBgModal}>
              <img src={process.env.PUBLIC_URL + './images/icons/bg_icon.png'} alt="" />
              <h2>Bank Guarantee</h2>
            </div>
          </div>
          {/* UPTO here: for Static BG category and form */}
        </>
        {/* )} */}
      </div>
      {otherServices.length > 0 ? (
        <>
          <h6 className="page-title">Video Tutorials</h6>
          <div className="row">
            {otherServices.map((otherService, index) => (
              <div className=" col-6 col-sm-4 col-md-3" key={index}>
                <a target="_blank" href={otherService.otherServicesUrl} className="content-item category-list">
                  <img src={process.env.PUBLIC_URL + './images/icons/' + otherService.iconFile} alt="" />
                  <h2>{otherService.name}</h2>
                </a>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Category;
