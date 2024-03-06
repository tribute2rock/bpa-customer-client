import React from 'react';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import AppRoutes from './AppRoutes';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import store from './redux/configureStore';
import './assets/scss/main.scss';
import { logout } from './redux/user/userSlice';
import { IdleTimerProvider } from 'react-idle-timer';
const loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;
const App = (props) => {
  let persistor = persistStore(store);
  const onIdle = () => {
    // console.log('user is idle..');
    store.dispatch(logout());
    window.location.reload(true);
  };
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ToastContainer />
        <HashRouter>
          <React.Suspense fallback={loading()}>
            <IdleTimerProvider timeout={1000 * 630} onIdle={onIdle}>
              <AppRoutes />
            </IdleTimerProvider>
          </React.Suspense>
        </HashRouter>
      </PersistGate>
    </Provider>
  );
};

export default App;
