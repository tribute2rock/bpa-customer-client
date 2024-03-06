import { server } from '../../../../config/server';
const branches = '/channel-manager/branches-lists';
const pushToCCMS = '/channel-manager/toccms';
const url = '/channel-manager/statusccms';

export const getBranchLists = (callback) => {
  server
    .get(`${branches}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const createRequestToCCMS = (body, callback) => {
    server
      .post(`${pushToCCMS}`, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        callback(null, res.data);
      })
      .catch((err) => {
        callback(err);
      });
  };
  
export const getCCMSRequests = (searchParams,callback) => {
    server
    .get(url, {
        params: searchParams,
      })
    .then((response) => {
      callback(response.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
  };
