import axios from 'axios';
import { getAuthorizationToken } from './apiHelper';
import { toast } from 'react-toastify';
import store from '../redux/configureStore';
import { fetchRefreshToken, logout } from '../redux/user/userSlice';
const server = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

// Add a request interceptor
server.interceptors.request.use(
  (config) => {
    let token = getAuthorizationToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Access-Control-Allow-Origin'] = '*';
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    alert('interceptor request has error');
    return Promise.reject(error);
  }
);

server.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    const expectedError = error.response && error.response.status >= 400 && error.response.status <= 500;
    if (expectedError) {
      // orginal request
      const originalRequest = error.config;
      if (error.response.status === 500) {
        toast.error('Server is not responding, please try again later.');
      }
      // if unauthorized user tries to directly access the api/auth/refresh route
      // if (originalRequest.url === `/refresh-token`) {
      //   store.dispatch(logout());
      //   setTimeout(() => {
      //     window.location.href = '/auth/login';
      //   }, 2000);
      // }

      // For authorized refresh token
      if (error.response.status === 401) {
        if (error.response.data) {
          // provide new tokens.
          const res = await store.dispatch(fetchRefreshToken());
          // if (res.meta.requestStatus === 'rejected') {
          //   window.location.href = '/auth/login';
          // }
          if (res.meta.requestStatus === 'rejected') {
            store.dispatch(logout());
            // toast.error('Login session expired.');
            window.location.href = '/#login';
          }
          if (res.meta.requestStatus === 'fulfilled') {
            // window.location.reload();

            const request = {
              ...originalRequest,
              headers: {
                Authorization: 'Bearer ' + res.payload.accessToken,
              },
            };
            return axios(request);
          }
        } else {
          toast.error('Bad request');
        }
      }
      return Promise.reject(error);
    }
  }
);

export { server };
