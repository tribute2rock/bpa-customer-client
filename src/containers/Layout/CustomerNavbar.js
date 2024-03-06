import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import metaRoutes from '../../config/meta_routes';
import { addRedirectUrl, logout } from '../../redux/user/userSlice';
import store from '../../redux/configureStore';
import themeData from '../../config/theme';

const CustomerNavbar = (props) => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user.userInfo);
  const notification = useSelector((state) => state.notification.value);

  const handleLogout = () => {
    store.dispatch(logout());
    props.history.push(metaRoutes.home);
  };
  const handleLogin = () => {
    const url = props.history.location.pathname + props.history.location.search;
    dispatch(addRedirectUrl(url));
    props.history.push(metaRoutes.login);
  };

  const handleMyRequests = () => {
    props.history.push(metaRoutes.requestHistory);
  };
  const handleNewRequests = () => {
    props.history.push(metaRoutes.home);
  };
  return (
    <>
      <section className="nav-top">
        <div className="logo-section container d-flex align-items-center">
          <Link to={'/home'}>
            <img src={themeData.logo} alt="logo" />
          </Link>
          <div className="btn-top-group ml-auto">
            {!userInfo ? (
              <>
                {/* <a href="" onClick={handleLogin} className="btn btn-custom">
                  Log In
                </a> */}
              </>
            ) : (
              <>
                <span onClick={handleMyRequests} className="customer-nav-link">
                  My Request
                  {/* <span
                    className="badge badge-light text-danger"
                    style={{ verticalAlign: "super" }}
                  >
                    {notification}
                  </span> */}
                </span>
                <span onClick={handleNewRequests} className="customer-nav-link">
                  New Request
                </span>
                <span onClick={handleLogout} className="customer-nav-link">
                  Log Out
                </span>
                {userInfo ? <span className="welcome-text ml-3">Hi, {userInfo.accountName}</span> : null}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CustomerNavbar;
