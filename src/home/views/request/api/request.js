const { server } = require('../../../../config/server');
const url = '/requests';
const url2 = '/request';
const url4 = '/req';
const url1 = '/generalCategoryRequest';
const commentUrl = '/reqcomment';
const fileUrl = '/requestfile';
const pushToCCMS = '/channel-manager/toccms';

export const createRequest = (body, callback) => {
  server
    .post(`${url}`, body, {
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

export const createGeneralRequest = (body, callback) => {
  server
    .post(`${url1}`, body, {
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

export const GetTokenFromCCMS = (body, callback) => {
  server
    .post(`${url}`, body, {
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

export const createRequestToCCMS = async (body) => {
  return await server
    .post(`${pushToCCMS}`, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // .then((res) => {
    //   callback(null, res.data);
    // })
    // .catch((err) => {
    //   console.log("FDFD", err)
    //   callback(err);
    // });
};

export const getRequests = (searchParams, callback) => {
  server
    .get(`${url}`, {
      params: searchParams,
    })
    .then((response) => {
      callback(response.data.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
};
export const getSingleRequestById = (id, callback) => {
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

export const getCategoryByRequestId = (id, callback) => {
  server
    .get(`requests/${id}/category`)
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

export const getRequestById = (output, callback) => {
  server
    .get(`${url4}`, {
      params: output,
    })

    .then((response) => {
      callback(response.data.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
};
export const getFormsByRequestKey = (Key, callback) => {
  server
    .get(`${url}/${Key}`)

    .then((response) => {
      callback(response.data.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
};
// export const editRequest = (data, callback) => {
//   server
//     .post(`${url}/${data.id}`, {
//       data: data,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     })
//     .then((res) => callback(null, res.data))
//     .catch((err) => callback(err));
// };

export const updateRequest = (id, body, callback) => {
  server
    .put(`${url2}/${id}`, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => callback(null, res))
    .catch((err) => {
      callback(err);
    });
};

export const getComment = (data, callback) => {
  server
    .get(`${commentUrl}/${data.id}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};

export const getRequestTemplate = (id, callback) => {
  server
    .get(`/request/${id}/getPrintTemplate`)
    .then((res) => {
      callback(null, res.data.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const createAndDownloadPdf = async (requestId, templateId) => {
  return await server.get(`/preview-request/${requestId}/${templateId}?action=view`);
};