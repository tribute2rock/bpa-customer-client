import React, { useState, useEffect } from 'react';
import CustomerFooter from '../containers/Layout/CustomerFooter';
import CustomerNavbar from '../containers/Layout/CustomerNavbar';
import { useDispatch, useSelector } from 'react-redux';
import { server } from '../config/server';
import { Redirect } from 'react-router-dom';
import { addToken, adduserInfo } from '../redux/user/userSlice';
import jwt_decode from 'jwt-decode';
import { toast } from 'react-toastify';
import toastConst from '../constants/toast';

import { useTimer } from 'react-timer-hook';
import { NewUser } from './new-user';

function MyTimer({ expiryTimestamp }) {
  const { seconds, minutes, isRunning } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn('onExpire called'),
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <b className="mr-2">Resend OTP After </b>
      <div
        style={{
          fontSize: '25px',
          color: ' rgb(255, 255, 255)',
          borderRadius: '5px',
          display: 'inline-flex',
          padding: '8px 10px 6px',
          letterSpacing: '2px',
          alignItems: 'center',
          margin: '10px 0',
          background: '#cc2440',
          background:
            '-moz-linear-gradient(top,  #cc2440 0%, #cc2440 45%, #bc002c 49%, #bc002c 51%, #cc2440 55%, #cc2440 100%)',
          background:
            '-webkit-linear-gradient(top,  #cc2440 0%,#cc2440 45%,#bc002c 49%,#bc002c 51%,#cc2440 55%,#cc2440 100%)',
          background: 'linear-gradient(to bottom,  #cc2440 0%,#cc2440 45%,#bc002c 49%,#bc002c 51%,#cc2440 55%,#cc2440 100%)',
          filter:
            'progid:DXImageTransform.Microsoft.gradient( startColorstr="#cc2440", endColorstr="#cc2440",GradientType=0 )',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            lineHeight: '1',
          }}
        >
          {minutes}
        </span>
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            lineHeight: '1',
            marginBottom: '4px',
          }}
        >
          :
        </span>
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            lineHeight: '1',
          }}
        >
          {seconds}
        </span>
      </div>
      <p>
        {isRunning ? (
          ''
        ) : (
          <button className="btn btn-custom btn-block" onClick={() => window.location.reload(false)}>
            Resend OTP
          </button>
        )}
      </p>
    </div>
  );
}

const OTPPage = (props) => {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 239);

  const [newUser, setNewUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('please wait opt is loading.');
  // const [otpCode, setOtpCode] = useState();
  const [loading, setLoading] = useState(false);
  const loginInfo = useSelector((state) => state.user.loginInfo);
  const redirectUrl = useSelector((state) => state.user.redirectUrl);
  const userInfo = useSelector((state) => (state.user?.userInfo ? state.user?.userInfo : 0));
  const [passwordResetView, setPasswordResetView] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('OTP PAGE user info', userInfo ? userInfo : 'no info');
    if (userInfo) {
      props.history.push('/home');
    } else {
      sendOTP();
    }
    // getTokenChannelManager();
  }, [passwordResetView]);

  const sendOTP = async () => {
    let loginData = verifyLoginUser();
    const res = await server.post('/send-otp', loginData);
    // if (res.data.status == 'Success') {
    //   if (res.data.data) {
    //     setOtpCode(res.data.data ? res.data.data : 'please try after few minutes');
    //   }
    // }
  };

  const verifyLoginUser = () => {
    let loginData = {};
    if (loginInfo && loginInfo.email) {
      loginData = {
        email: loginInfo.email,
      };
    } else if (loginInfo && loginInfo.accountNumber) {
      loginData = {
        accountNumber: loginInfo.accountNumber,
        mobileNumber: loginInfo.mobileNumber,
      };
    }
    return loginData;
  };
  // const getTokenChannelManager = async () => {
  //   const res = await server.get('/channel-manager/auth-token');
  //   if (res.data.msg === 'success') {
  //     console.log('get channel manager token success');
  //   }
  // };

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setOtp(value);
  };
  const handleVerify = async () => {
    let loginData = verifyLoginUser();
    setLoading(true);
    let passwordExpired = false;

    try {
      const res = await server.post('/login', {
        ...loginData,
        otp,
      });
      if (res.data.status === 'Success') {
        passwordExpired = res.data.data.passwordExpire;
        if (passwordExpired) {
          setUserEmail(loginData.email);
          setPasswordResetView(true);
        } else {
          setPasswordResetView(false);
          let userData = jwt_decode(res.data.data.accessToken); //TODO: Is it okay to decode token here??
          dispatch(adduserInfo(userData));
          dispatch(addToken(res.data.data));
          setTimeout(() => {
            props.history.push(redirectUrl);
          }, 20);
        }
      }
      setLoading(false);
    } catch (err) {
      if (err.response.data.status === 'Failed') {
        toast.error(err.response.data.message, toastConst.error);
      }
      setLoading(false);
    }
  };

  if (!loginInfo) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <CustomerNavbar {...props} />
      <div className="container content-section">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="custom-card mt-5">
              {!passwordResetView ? (
                <>
                  <div className="text-center mb-5">
                    <h3 className="text-dark">OTP Verification</h3>
                    <span className="text-muted">
                      Please provide OTP sent to your registered{' '}
                      {loginInfo && loginInfo.email ? ' email.' : ' mobile number.'}
                    </span>
                  </div>
                  <div className="form-group">
                    <label for="otp">OTP</label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      className="form-control"
                      placeholder="One Time Password"
                      onChange={handleChange}
                      disabled={!!loading}
                    />
                  </div>
                  <hr />
                  <div className="mt-30">
                    <button className="btn btn-custom btn-block" onClick={handleVerify} disabled={!!loading}>
                      Verify
                    </button>
                  </div>
                  <MyTimer expiryTimestamp={time} />
                </>
              ) : (
                <NewUser newUser={newUser} setNewUser={setNewUser} userEmail={userEmail} />
              )}
            </div>
          </div>
        </div>
      </div>
      <CustomerFooter />
    </>
  );
};

export default OTPPage;
