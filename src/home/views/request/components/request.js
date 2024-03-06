import React, { useState, useEffect } from 'react';
import A from '../../../../config/url';
import metaRoutes from '../../../../config/meta_routes';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import RequestStatus from '../constants';
import { getComment } from '../api/request';
import { toast } from 'react-toastify';

export const Request = (props) => {
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  useEffect(() => {
    getCommentData();
  }, []);

  const { request } = props;
  const filterStatus = (status) => {
    switch (status) {
      case 1:
        return {
          tags: (
            <span className="pending">
              <i class="fas fa-info-circle"></i>
            </span>
          ),
          class: 'content-item form-item',
        };
      case 2:
        return {
          tags: (
            <span className="pending">
              <i class="fas fa-info-circle"></i>
            </span>
          ),
          class: 'content-item form-item',
        };
      case 3:
        return {
          tags: (
            <span className="pending">
              <i class="fas fa-info-circle"></i>
            </span>
          ),
          class: 'content-item form-item',
        };
      case 4:
        return {
          tags: (
            <span className="completed">
              <i className="fa fa-check-circle" />
            </span>
          ),
          class: 'content-item form-item completed-status',
        };
      case 5:
        return {
          tags: (
            <>
              <span className="pending">
                <i className="fa fa-edit" />
              </span>
            </>
          ),
          class: 'content-item form-item',
        };
      default:
        return {
          class: '',
        };
    }
  };

  const truncate = (input) => (input.length > 20 ? `${input.substring(0, 20)} ...` : input);

  const requestBody = (request, status) => {
    const requestName = request ? truncate(request.form.name) : null;
    return (
      <>
        <h2>{requestName}</h2>
        {filterStatus(status).tags}
        <span>
          {new Date(request.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
        </span>
      </>
    );
  };

  const getCommentData = (e) => {
    const id = props.request.id;
    // const status =
    const params = { id };
    getComment(params, (err, data) => {
      setComment(data);
    });
  };

  return (
    <>
      <div
        className={filterStatus(props.status).class}
        key={props.requestKey}
        style={{ width: '300px', marginRight: '30px' }}
        onClick={handleShow}
      >
        {props.status === RequestStatus.returned || props.status === RequestStatus.drafts
          ? requestBody(request, props.status)
          : requestBody(request, props.status)}
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <table className="table table-striped mb-0 table-hover">
            <tbody>
              <tr>
                <td>Request</td>
                <td>
                  <b>{props.request.form.name}</b>
                </td>
              </tr>
              <tr>
                <td>Comment</td>
                <td>
                  <b>
                    {' '}
                    {comment && request.length !== 0
                      ? comment &&
                        comment.map((data) => {
                          return <b>{data.comment}</b>;
                        })
                      : null}
                    {}
                  </b>
                </td>
              </tr>
              <tr>
                <td>Requested Date</td>
                <td>
                  <b>
                    {new Date(props.request.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                  </b>
                </td>
              </tr>
              {/* <tr>
                <td>Comment</td>
                <td>
                  <b>{props.request.form.comment} </b>
                </td>
              </tr> */}
              {props.status === RequestStatus.completed && (
                <tr>
                  <td>Approved Date</td>
                  <td>
                    <b>12-18-2021</b>
                  </td>
                </tr>
              )}
              {(props.status === RequestStatus.returned || props.status === RequestStatus.drafts) && (
                <tr>
                  <td>Actions</td>
                  <td>
                    <Link
                      to={{
                        pathname: metaRoutes.formEditVerify,
                        search: '?i=' + A.getHash(request.id),
                        status: props.status,
                        state: { fromRequest: '?i=' + A.getHash(request.id) },
                      }}
                    >
                      <b>
                        <i className="fa fa-edit" />
                        {' Edit Request'}
                      </b>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </>
  );
};
