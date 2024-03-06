import React, { useState } from 'react';
import A from '../../../config/url';
import query from 'querystring';
import metaRoutes from '../../../config/meta_routes';
import { toast } from 'react-toastify';
import { getRequestById } from '../request/api/request';
import { getDraftById } from '../request/api/draftRequest';
import status from '../request/constants';
import toastConst from '../../../constants/toast';

const EditFormVerification = (props) => {
  const statusId = props.location.status;
  const qs = query.parse(props.location.search);
  const id = A.getId(qs['?i']);
  const [key, setKey] = useState();
  const [authCode, setAuthCode] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
    const output = { id, key, authCode };
    if (statusId === status.drafts) {
      getDraftById(output, (data, err) => {
        if (err) {
          toast.error(err.response.data.message, toastConst.error);
          // props.history.push(metaRoutes.formEditVerify + "?i=" + A.getHash(id));
        } else {
          toast.success('Success! Authorization code verified.', toastConst.success);
          props.history.push(metaRoutes.formEdit + '?i=' + A.getHash(id) + '&type=draft');
        }
      });
    } else {
      getRequestById(output, (data, err) => {
        if (err) {
          toast.error(err.response.data.message);
          // props.history.push(metaRoutes.formEditVerify + "?i=" + A.getHash(id));
        } else {
          toast.success('Success! Authorization code verified.', toastConst.success);
          props.history.push(
            // metaRoutes.formEdit + "?i=" + A.getHash(id) + "&type=return"
            metaRoutes.RequestDetails + '?i=' + A.getHash(id) + '&type=return'
          );
        }
      });
    }
  };
  return (
    <div className="container content-section">
      <div className="row">
        <div className="col-lg-8 offset-md-2 text-center">
          <div className="custom-card mt-5">
            <h3>Verification Form</h3>
            <p className="faded-text">
              Please enter the Authorization Code you received in the mobile number associated with the account number
            </p>
            <hr />
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
              encType="multipart/form-data"
            >
              {/* <div className="form-group row">
                <label for="otp" className="col-sm-2 col-form-label">
                  Key
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    id="key"
                    name="key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="form-control"
                    placeholder="Key"
                  />
                </div>
              </div> */}

              <div className="form-group row">
                <label for="otp" className="col-sm-2 col-form-label">
                  Authorization Code
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    name="authCode"
                    id="auth"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="form-control"
                    placeholder="Authorization code"
                  />
                </div>
              </div>
              <hr />
              <div className="mt-30 text-right">
                <button className="btn btn-custom btn-gradient">CONFIRM</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFormVerification;
