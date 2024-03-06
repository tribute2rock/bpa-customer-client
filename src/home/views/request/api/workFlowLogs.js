const { server } = require("../../../../config/server");
const url = '/workflowlogs';

export const addComments = (body, callback) => {
  server
    .post(`${url}`, body)
    .then(res => {
      return res.data;
    })
    .then(data => {
      callback(null, data);
    })
    .catch(err => {
      callback(err);
    });
};




