import React, { useEffect, useState, useRef, useMemo } from 'react';
import CustomerFooter from '../containers/Layout/CustomerFooter';
import CustomerNavbar from '../containers/Layout/CustomerNavbar';
import { useDispatch, useSelector } from 'react-redux';
import { server } from '../config/server';
import metaRoutes from '../home/meta_routes';
import { toast } from 'react-toastify';
import { login } from '../redux/user/userSlice';
import Input from '../components/Input';
import { Loader, LoadingOverlay, Switch } from '@mantine/core';
import { NewUser } from './new-user';
import captchaImg from '../assets/images/captchaBackground.png';
const characters = 'abcdefghijklmnopqrstuvwxyz0123456789@#$&ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function generateString(length) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const LoginPage = (props) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [coorporateLogin, setCoorporateLogin] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [errorCap, setErrorCap] = useState(true);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const buttonRef = useRef();
  const [reCaptcha, setReCapcha] = useState('');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    if (token.accessToken) {
      props.history.push('/');
    }
  }, [token]);

  let captcha = useMemo(() => generateString(6), [errorCap]);

  const doSubmit = (e) => {
    e.preventDefault();
    var element = document.getElementById('successBTN');
    var inputData = document.getElementById('user_captcha_input');
    element.style.cursor = 'wait';
    element.innerHTML = 'Checking...';
    inputData.disabled = true;
    element.disabled = true;

    var myFunctions = function () {
      if (captcha == document.getElementById('user_captcha_input').value.trim()) {
        element.disabled = true;
        setIsCaptchaVerified(true);
        element.style.backgroundColor = 'green';
        element.innerHTML = 'Captcha Verified';

        element.style.cursor = 'not-allowed';
        inputData.style.display = 'none';
      } else {
        setErrorCap((prev) => !prev);
        element.style.backgroundColor = 'red';
        element.style.cursor = 'not-allowed';
        element.innerHTML = 'Not Matched';
        element.disabled = true;
        //  element.disabled = true;

        var myFunction = function () {
          element.style.backgroundColor = '#007bff';
          element.style.cursor = 'pointer';
          element.innerHTML = 'Verify Captcha';
          element.disabled = false;
          inputData.disabled = false;
          inputData.value = '';
        };
        setTimeout(myFunction, 3000);
      }
    };
    setTimeout(myFunctions, 3000);
  };

  // const getcaptcha = () => {
  //   server
  //     .get('/captcha')
  //     .then((res) => {
  //       // console.log(res.data.captcha)
  //       // setReCapcha(res.data.captcha)
  //       // if (res.data.status === 'Success') {
  //       // }
  //     })
  //     .catch((err) => {
  //       toast.error('Please provide valid information');
  //       setLoading(false);
  //     });
  // };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    switch (name) {
      case 'mobileNumber':
        setMobileNumber(value);
        break;
      case 'accountNumber':
        setAccountNumber(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const postData = {
      accountNumber: accountNumber,
      mobileNumber: mobileNumber,
    };

    const cooperateUser = {
      email,
      password,
    };

    if (!isCaptchaVerified) {
      return toast.error('ReCaptcha is required');
    }

    setLoading(true);

    server
      .post(coorporateLogin ? 'cooperate-login' : '/initiate-login', coorporateLogin ? cooperateUser : postData)
      .then((res) => {
        console.log(res.data.status);
        if (res.data.status === 'Success') {
          if (coorporateLogin) {
            dispatch(login({ email: cooperateUser.email }));
          } else {
            dispatch(login(postData));
          }
          props.history.push(metaRoutes.otpPage);
        }
      })
      .catch((err) => {
        setIsCaptchaVerified(false);
        if (err?.response?.data?.status === 'Failed') {
          toast.error(err?.response?.data?.message);
          setErrors(err?.response?.data?.data?.errors);
        } else toast.error('Please provide valid information');
      });
    setLoading(false);
  };

  const verifyCallback = (response) => {
    if (response) {
      setReCapcha(true);
    }
  };

  // const recaptchaLoaded = () => {
  //   // toast.warn('please select capcha before you proceed');
  // };

  return (
    <>
      <CustomerNavbar {...props} />
      <div className="container content-section">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="custom-card mt-5">
              <div className="text-center mb-5">
                <h3 className="text-dark">Customer Login</h3>
                <span className="text-muted">Please enter your login credentials to proceed</span>
              </div>
              <form onSubmit={handleLogin} onChange={handleChange}>
                <LoadingOverlay visible={loading} />
                {coorporateLogin ? (
                  <>
                    <Input
                      value={email}
                      type="email"
                      title="Email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="Email"
                      required
                      disabled={!!loading}
                      errors={errors}
                    />
                    <Input
                      value={password}
                      type="password"
                      required
                      id="password"
                      title="Password"
                      name="password"
                      className="form-control"
                      placeholder="password"
                      errors={errors}
                      disabled={!!loading}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      value={accountNumber}
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      title="Account Number"
                      required
                      className="form-control"
                      placeholder="Account Number"
                      errors={errors}
                      disabled={!!loading}
                    />
                    <Input
                      value={mobileNumber}
                      type="number"
                      required
                      id="mobileNumber"
                      errors={errors}
                      name="mobileNumber"
                      title="Mobile Number"
                      className="form-control"
                      placeholder="Mobile Number"
                      disabled={!!loading}
                    />
                  </>
                )}
                <div className="d-flex justify-content-between align-items-middle">
                  <div className="d-flex">
                    <label className="mr-2 col-form-label">Retail Login</label>
                    <Switch
                      checked={coorporateLogin}
                      onChange={(event) => {
                        setCoorporateLogin(event.currentTarget.checked);
                      }}
                      size="md"
                    />
                    <label className="ml-2 col-form-label">Corporate Login</label>
                  </div>
                  {/* <NewUser newUser={newUser} setNewUser={setNewUser} /> */}
                </div>
                <div className="mt-3">
                  {loading ? (
                    <>
                      <Loader variant="dots" />
                    </>
                  ) : (
                    <>
                      <div className={`form-group recaptcha-box ${isCaptchaVerified ? 'd-none' : ''}`}>
                        <div className="captcha-text" style={{ position: 'relative' }}>
                          {/* <img src={captchaImg} height="40" width="250px" style={{ marginTop: '-4px' }} /> */}
                          <h3
                            id="captcha"
                            style={{
                              position: 'absolute',
                              top: '15%',
                              left: '40%',
                              opacity: '0.7',
                              letterSpacing: '3px',
                              fontFamily: 'cursive',
                              fontSize: '22px',
                              // textDecoration: 'line-through',
                              // textDecorationThickness: '1px',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              WebkitTouchCallout: 'none',
                              MozUserSelect: 'none',
                            }}
                          >
                            {captcha}
                          </h3>
                        </div>
                        {/* <Captcha /> */}
                        <div className="d-flex align-items-center">
                          <input
                            placeholder="Enter Captcha Value"
                            id="user_captcha_input"
                            name="user_captcha_input"
                            className="form-control"
                            type="text"
                            autoComplete="off"
                            disabled={isCaptchaVerified}
                            style={{
                              border: '1px solid #edf0ee',
                              padding: '10px',
                              outline: 'none',
                              borderRadius: '5px',
                              height: '30px',
                            }}
                          />
                          {/* {isCaptchaVerified ? null : ( */}
                          <div
                            className="btn btn-primary ml-2 "
                            style={{ whiteSpace: 'nowrap' }}
                            id="successBTN"
                            onClick={(e) => doSubmit(e)}
                          >
                            Verify Captcha
                          </div>
                          {/* } */}
                        </div>
                      </div>
                    </>
                  )}
                  <button id="btn-proceed" className={'btn btn-custom btn-block'} disabled={!isCaptchaVerified}>
                    Proceed
                  </button>
                </div>
                {/* <hr />
                <div className="mt-30 text-right">
                  <button className="btn btn-custom btn-gradient" disabled={!!loading}>
                    PROCEED
                  </button>
                </div> */}
              </form>
            </div>
          </div>
        </div>
      </div>
      <CustomerFooter />
    </>
  );
};

export default LoginPage;
