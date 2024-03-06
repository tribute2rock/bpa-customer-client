import axios from 'axios';
const { server } = require('../../../../config/server');
const url = '/form';
const url2 = '/forms';
const url3 = '/general-form';
const searchUrl = '/searchForms';
const branches = '/mock-branches';
const REACT_APP_AUTH_USER = process.env.REACT_APP_AUTH_USER;
const REACT_APP_AUTH_PASS = process.env.REACT_APP_AUTH_PASS;
const SERVER = process.env.REACT_APP_SERVER_URL;

export const getForms = (callback) => {
  const tok = `${REACT_APP_AUTH_USER}:${REACT_APP_AUTH_PASS}`;
  const hash = Buffer.from(tok).toString('base64');
  const Basic = 'Basic ' + hash;
  axios
    .get(`${SERVER}${url}`, { headers: { Authorization: Basic } })
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const getFormById = (id, callback) => {
  server
    .get(`${url}/${id}`)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      callback(err);
    });
};
export const getGeneralFormById = async (id, callback) => {
  // await server
  //   .get(`${url3}/${id}`)
  //   .then((res) => {
  //     return res.data;
  //   })
  //   .then((data) => {
  //     callback(null, data);
  //   })
  //   .catch((err) => {
  //     callback(err);
  //   });
  try {
    let res = await server.get(`${url3}/${id}`);
    // console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getFormsByCatId = (id, callback) => {
  server
    .get(`${url2}/${id}`)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const getSearch = (data, callback) => {
  const { query, categoryId } = data;
  server
    .get(`${url2}/${categoryId}/search`, {
      params: {
        query,
      },
    })
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};

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

export const getDbBranch = (callback) => {
  server
    .get(`/dbBranches`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};
// export const getSearch = (data, callback) => {
//   server
//     .get(`${searchUrl}/${data}`)
//     .then((res) => {
//       return res.data;
//     })
//     .catch((err) => {
//       return err;
//     });
// };
