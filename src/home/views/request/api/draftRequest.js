import { server } from '../../../../config/server';
const url = '/draft-request';
const url1 = '/draft-requestId';
export const getAllBranches = (callback) => {
  server
    .get(`/dbBranches`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const saveDraft = (data, callback) => {
  server
    .post(`${url}`, data, {
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

export const getDrafts = (searchParams, callback) => {
  server
    .get(`${url}`, {
      params: searchParams,
    })
    .then((response) => {
      callback(response.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
};

export const getDraftById = (output, callback) => {
  server
    .get(`${url1}`, {
      params: output,
    })

    .then((response) => {
      callback(response.data.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
};

export const getDraftFormsByRequestKey = (id, callback) => {
  server
    .get(`${url}/${id}`)

    .then((response) => {
      callback(response.data.data, null);
    })
    .catch((err) => {
      callback(null, err);
    });
};

export const editDraftRequest = (data, callback) => {
  server
    .put(`${url}/${data.id}`, {
      data: data,
    })
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const deleteDraftRequest = (id, callback) => {
  // console.log('id => ', id);
  server
    .delete(`${url}/${id}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const getDraftRequestById = (id, callback) => {
  server
    .get(`/draft-request/${id}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};
