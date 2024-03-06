import React, { Suspense, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Container } from 'reactstrap';

// routes config
import routes from '../../home/routes';

import CustomerNavbar from './CustomerNavbar';
import CustomerFooter from './CustomerFooter';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotification } from '../../redux/notification/notificationSlice';

const Layout = (props) => {

  const loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;
  return (
    <div className="app">
      <CustomerNavbar {...props} />
      <main className="main mb-3">
        <Container>
          <Suspense fallback={loading()}>
            <Switch>
              {routes.map((route, idx) => {
                return route.component ? (
                  <Route
                    permission={route.permission}
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    component={route.component}
                    {...props}
                  />
                ) : null;
              })}
            </Switch>
          </Suspense>
        </Container>
      </main>
      <CustomerFooter />
    </div>
  );
};

export default Layout;
