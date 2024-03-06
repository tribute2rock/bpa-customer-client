import moment from "moment";

const Hashids = require("hashids").default;
const dateStamp = moment().format("YYYY-MM-DD");

const hashids = new Hashids(
  "",
  10,
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
);
const getHash = (id) => {
  return hashids.encode(id);
};
const getId = (hash) => {
  return hashids.decode(hash)[0];
};

export default {
  getHash,
  getId,
};
