import React, { useEffect, useState } from 'react';
import { getRequests } from '../api/request';
import { toast } from 'react-toastify';
import { Request } from './request';
import { useDispatch } from 'react-redux';
// import {
//   returnPending,
//   returnProcessing,
//   returnReturned,
//   returnCompleted,
//   returnDrafts,
// } from "../../../../redux/notification/notificationSlice";
import status from '../constants';
import { getDrafts } from '../api/draftRequest';
import A from '../../../../config/url';
import metaRoutes from '../../../../config/meta_routes';
import { Link } from 'react-router-dom';
import toastConst from '../../../../constants/toast';
import { persistor } from 'redux-persist';
import PaginationPage from '../../../../components/PaginationPage';

const getPageParams = (page, pageSize) => {
  let params = {};
  if (page) {
    params['page'] = page - 1;
  }
  if (pageSize) {
    params['pageSize'] = pageSize;
  }
  return params;
};
const handleIndex = (index, offset) => {
  return offset + index + 1;
};
const Requests = (props) => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    filterStatus();
    fetchRequests();
  }, [props.status]); //eslint-disable-line
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
  const fetchRequests = () => {
    let params = getPageParams(page, pageSize);
    let searchParams = {
      status: props.status,
      ...params,
    };
    if (Number(props.status) === status.drafts) {
      getDrafts(searchParams, (data, err) => {
        if (!err) {
          setRequests(data);
        } else {
          toast.error('No Any Requests.', toastConst.error);
        }
      });
    } else {
      getRequests(searchParams, (data, err) => {
        if (!err) {
          setRequests(data.request);
          setTotalItems(data.request.totalItems);
          setTotalPages(data.request.totalPages);
          setOffset(data.request.offset);
        } else {
          // toast.error('No Any Requests.', toastConst.error);
        }
      });
    }
  };
  const dispatch = useDispatch();

  /**
   *
   * @param {requests} requests
   * count number of requests
   * @returns total requests
   */

  // function countRequest(requests) {
  //   return requests.length;
  // }
  // var total = countRequest(requests);

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  // eslint-disable-next-line array-callback-return
  // if (total === 0) {
  //   if (props.status === 1) {
  //     dispatch(returnPending(null));
  //   }
  //   if (props.status === 2) {
  //     dispatch(returnProcessing(null));
  //   }
  //   if (props.status === 3) {
  //     dispatch(returnReturned(null));
  //   }
  //   if (props.status === 4) {
  //     dispatch(returnCompleted(null));
  //   }
  //   if (props.status === 5) {
  //     dispatch(returnDrafts(null));
  //   }
  // } else
  //   requests.map((req) => {
  //     if (req.statusId === 1) {
  //       dispatch(returnPending(total));
  //     }
  //     if (req.statusId === 2) {
  //       dispatch(returnProcessing(total));
  //     }
  //     if (req.statusId === 3) {
  //       dispatch(returnReturned(total));
  //     }
  //     if (req.statusId === 4) {
  //       dispatch(returnCompleted(total));
  //     }
  //     if (req.statusId === 5) {
  //       dispatch(returnDrafts(total));
  //     }
  //   });

  useEffect(() => {
    fetchRequests();
  }, [dispatch, pageSize, page, offset]);
  return (
    <>
      <div className="row">
        <table className="table table-bordered">
          <thead className="thead-light">
            <tr>
              <th scope="col">S.N.</th>
              <th scope="col">Request Name</th>
              <th scope="col">Request ID</th>
              <th scope="col">Beneficiary Name</th>
              <th scope="col">Requested Date</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests && requests.length !== 0 ? (
              requests &&
              requests?.pageData?.map((request, key) =>
                // <Request
                //   request={request}
                //   key={key}
                //   status={props.status}
                //   requestKey={key}
                // />

                props.status === status.returned ? (
                  // <Link
                  //   className="col-md-4"
                  //   to={{
                  //     pathname: metaRoutes.formEditVerify,
                  //     search: '?i=' + A.getHash(request.id),
                  //     status: props.status,
                  //     state: { formEditVerify: '?i=' + A.getHash(request.id) },
                  //   }}
                  // >
                  <>
                    <tr>
                      <th scope="row">{key + 1}</th>
                      <td>
                        {request.form
                          ? request.requestRepeat !== null
                            ? request.form.name + '-' + request.requestRepeat
                            : request.form.name
                          : null}
                      </td>
                      <td>
                        {filterStatus(status).tags}
                        <span>
                          Id : <b className="text-muted"> {request ? request.requestKey : null}</b>
                        </span>
                      </td>
                      <td>
                        {request.request_values.length > 0 ? request.request_values[0].value.slice(1, -1).toUpperCase() : ''}
                      </td>
                      <td>
                        {new Date(request.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <Link
                          className="btn btn-sm btn-dark"
                          to={{
                            pathname: metaRoutes.RequestDetails,
                            search: '?i=' + A.getHash(request.id) + '&type=return',
                            status: props.status,
                            state: { RequestDetails: '?i=' + A.getHash(request.id) + '&type=return' },
                          }}
                        >
                          <i class="fas fa-eye"></i> Detail
                        </Link>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <th scope="row">{key + 1}</th>
                      <td>
                        {request.form
                          ? request.requestRepeat !== null
                            ? request.form.name + '-' + request.requestRepeat
                            : request.form.name
                          : null}
                      </td>
                      <td>
                        {filterStatus(status).tags}
                        {request && request.requestKey ? (
                          <>
                            <span>
                              Id : <b className="text-muted">{request.requestKey}</b>
                            </span>
                          </>
                        ) : null}
                      </td>
                      <td>
                        {props.status == 5
                          ? ''
                          : request?.request_values && request.request_values.length > 0
                          ? request.request_values[0].value.slice(1, -1).toUpperCase()
                          : ''}
                      </td>
                      <td>
                        {new Date(request.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <Link
                          className="btn btn-sm btn-dark"
                          to={{
                            pathname: metaRoutes.RequestDetails,
                            search: '?i=' + A.getHash(request.id) + '&&' + '?s=' + props.status,
                            status: props.status,
                            state: {
                              RequestDetails: '?i=' + A.getHash(request.id) + '?s=' + props.status,
                            },
                          }}
                        >
                          <i class="fas fa-eye"></i> Detail
                        </Link>
                      </td>
                    </tr>
                  </>
                )
              )
            ) : (
              <tr>
                <td colspan="6">
                  <div className="jumbotron w-100 p-3">
                    <p className="m-0 text-center">
                      <b>No Data Found</b>
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {props.status == 5 ? (
        <></>
      ) : (
        <PaginationPage
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          offset={offset}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          page={page}
        />
      )}
    </>
  );
};

export default Requests;
