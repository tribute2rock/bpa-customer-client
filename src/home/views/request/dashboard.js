import React, { useEffect, useState } from 'react';
import { getRequests } from './api/request';
import { toast } from 'react-toastify';

const Dashboard = (props) => {
  const [request, setRequest] = useState([]);
  const [searchData, setSearchData] = useState(1);
  useEffect(() => {
    getData();
  }, [searchData]); //eslint-disable-line

  const getData = () => {
    setSearchData(1);
    getRequests(searchData, (err, data) => {
      if (err) toast.error('Error!');
      else {
        setRequest(data.data.request);
      }
    });
  };
  return (
    <div className="container content-section">
      <h6 className="page-title">List of Requested Forms</h6>
      <h6 className="sub-title">Completed Forms</h6>
      <hr />

      <div className="row">
        {request.map((requests, idx) =>
          requests.statusId === 4 && requests.isDraft === false ? (
            <div className="col-md-4" key={idx}>
              <div className="content-item form-item completed-status">
                <h2>{requests.form.name}</h2>
                <span className="completed">
                  <i className="fa fa-check-circle" />
                </span>
                <span>{requests.status.name}</span>
              </div>
            </div>
          ) : null
        )}

        {request.map((requests, idx) =>
          requests.statusId === 1 && requests.isDraft === false ? (
            <div className="col-md-4" key={idx}>
              <div className="content-item form-item completed-status">
                <h2>{requests.form.name}</h2>
                <span className="completed">
                  <i className="fa fa-check-circle" />
                </span>
                <span> {requests.status.name}</span>
              </div>
            </div>
          ) : null
        )}
        {request.map((requests, idx) =>
          requests.statusId === 2 && requests.isDraft === false ? (
            <div className="col-md-4" key={idx}>
              <div className="content-item form-item completed-status">
                <h2>{requests.form.name}</h2>
                <span className="completed">
                  <i className="fa fa-check-circle" />
                </span>
                <span>{requests.status.name}</span>
              </div>
            </div>
          ) : null
        )}
      </div>

      <h6 className="sub-title">Returned Forms</h6>
      <hr />
      {request.map((requests, idx) => {
        return requests.statusId === 3 && requests.isDraft === false ? (
          <div className="row" key={idx}>
            <div className="col-md-4">
              <div className="content-item form-item">
                <h2>{requests.form.name}</h2>
                <span className="pending">
                  <i class="fas fa-info-circle"></i>
                </span>
                <span>{requests.status.name}</span>
              </div>
            </div>
          </div>
        ) : null;
      })}

      <h6 className="sub-title">Incomplete Forms</h6>
      <hr />
      {request.map((requests, idx) => {
        return requests.isDraft === true ? (
          <div className="row" key={idx}>
            <div className="col-md-4">
              <div className="content-item form-item">
                <h2>{requests.form.name}</h2>
                <span className="pending">
                  <i>75%</i>
                </span>
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-animated progress-bar-striped bg-danger"
                    role="progressbar"
                    aria-valuenow="75"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ width: '75%' }}
                  />
                </div>

                <span>Incomplete</span>
              </div>
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
};

export default Dashboard;
