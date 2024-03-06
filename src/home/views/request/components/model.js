import React from "react";

export const Model = (props) => {
  return (
    <div
      className="modal show"
      id={props.id}
      tabIndex="1"
      role="dialog"
      aria-hidden="false"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          {/*<div className="modal-header">*/}
          {/*  <h5 className="modal-title" id="exampleModalLabel">*/}
          {/*    Modal title*/}
          {/*  </h5>*/}
          {/*  <button*/}
          {/*    type="button"*/}
          {/*    className="close"*/}
          {/*    data-dismiss="modal"*/}
          {/*    aria-label="Close"*/}
          {/*  >*/}
          {/*    <span aria-hidden="true">&times;</span>*/}
          {/*  </button>*/}
          {/*</div>*/}
          <div className="modal-body">
            <table className="table table-striped mb-0 table-hover">
              <tbody>
                <tr>
                  <td>Form Name</td>
                  <td>
                    <b>{props.request.form.name}</b>
                  </td>
                </tr>
                <tr>
                  <td>Requested Date</td>
                  <td>
                    <b>12-12-2021</b>
                  </td>
                </tr>
                <tr>
                  <td>Approved Date</td>
                  <td>
                    <b>12-18-2021</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/*<div className="modal-footer">*/}
          {/*  <button*/}
          {/*    type="button"*/}
          {/*    className="btn btn-custom btn-gradient"*/}
          {/*    data-dismiss="modal"*/}
          {/*  >*/}
          {/*    Close*/}
          {/*  </button>*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
};
