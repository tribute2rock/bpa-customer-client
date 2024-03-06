import React, { useState, useEffect } from 'react';
import Requests from './components/requests';
import status from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchNotification } from '../../../redux/notification/notificationSlice';

import processingImg from '../../../icons/processing.svg';
import pendingImg from '../../../icons/pending.svg';
import completedImg from '../../../icons/completed.svg';
import closeImg from '../../../icons/closed.svg';
import draftImg from '../../../icons/draft.svg';
import returnedImg from '../../../icons/returned.svg';

const RequestHistory = () => {
  const [pending, setPending] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [returned, setReturned] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [closed, setClosed] = useState(false);
  const [drafts, setDrafts] = useState(false);
  // const [notification, setNotification] = useState();

  const dispatch = useDispatch();
  const notification = useSelector((state) => state.notification.data);
  useEffect(() => {
    dispatch(fetchNotification());
  }, [dispatch]);

  const handleTabClick = (e) => {
    hideAll();

    dispatch(fetchNotification());
    switch (e.target.dataset.target) {
      case 'completed':
        setCompleted(true);
        break;
      case 'pending':
        setPending(true);
        break;
      case 'processing':
        setProcessing(true);
        break;
      case 'returned':
        setReturned(true);
        break;
      case 'closed':
        setClosed(true);
        break;
      case 'drafts':
        setDrafts(true);
        break;
      default:
        break;
    }
  };

  const hideAll = () => {
    setCompleted(false);
    setPending(false);
    setProcessing(false);
    setReturned(false);
    setClosed(false);
    setDrafts(false);
  };

  /**
   * Generate the class name based on the status of the nav link.
   *
   * @param {*} s The state value of tab status Completed|Processing|Drafts|Returned
   */
  const getNavLinkClass = (s) => {
    let c = 'nav-link';
    if (s) {
      c = c + ' active';
    }
    return c;
  };

  /**
   * Generate the class name based on the status of the tabs.
   *
   * @param {*} s The state value of tab status Completed|Processing|Drafts|Returned
   */
  const getTabPaneClass = (s) => {
    let c = 'tab-pane';
    if (s) {
      c = c + ' active';
    }
    return c;
  };

  const pendingNotification = useSelector((state) => state.notification?.data?.Pending);
  const processingNotification = useSelector((state) => state.notification?.data?.Processing);
  const returnedNotification = useSelector((state) => state.notification?.data?.Returned);
  const completedNotification = useSelector((state) => state.notification?.data?.Completed);
  const closedNotification = useSelector((state) => state.notification?.data?.Closed);
  const draftsNotification = useSelector((state) => state.notification?.data?.draft);

  return (
    <>
      <div className="container content-section">
        <div className="row">
          <div className="col-md-12">
            <div className="pt-5 pb-5">
              <div className="custom-tab">
                <ul className="nav nav-tabs nav-tabs-top justify-content-center">
                  <li className="nav-item" onClick={handleTabClick} data-target="pending">
                    <span className={getNavLinkClass(pending) + ` d-flex align-items-center`} data-target="pending">
                      <img src={pendingImg} alt="" data-target="pending" />
                      Pending
                      <span className="badge badge-danger ml-1" style={{ verticalAlign: 'super' }} data-target="pending">
                        {pendingNotification == 0 ? null : pendingNotification}
                      </span>
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleTabClick}>
                    <span className={getNavLinkClass(processing) + ` d-flex align-items-center`} data-target="processing">
                      <img src={processingImg} alt="" data-target="processing" />
                      Processing
                      <span className="badge badge-danger ml-1" style={{ verticalAlign: 'super' }} data-target="processing">
                        {processingNotification == 0 ? null : processingNotification}
                      </span>
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleTabClick}>
                    <span className={getNavLinkClass(returned) + ` d-flex align-items-center`} data-target="returned">
                      <img src={returnedImg} alt="" data-target="returned" />
                      Returned
                      <span className="badge badge-danger ml-1" style={{ verticalAlign: 'super' }} data-target="returned">
                        {returnedNotification == 0 ? null : returnedNotification}
                      </span>
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleTabClick}>
                    <span className={getNavLinkClass(completed) + ` d-flex align-items-center`} data-target="completed">
                      <img src={completedImg} alt="" data-target="completed" />
                      Completed
                      <span className="badge badge-danger ml-1" style={{ verticalAlign: 'super' }} data-target="completed">
                        {completedNotification == 0 ? null : completedNotification}
                      </span>
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleTabClick}>
                    <span className={getNavLinkClass(closed) + ` d-flex align-items-center`} data-target="closed">
                      <img src={closeImg} alt="" data-target="closed" />
                      Closed
                      <span className="badge badge-danger ml-1" style={{ verticalAlign: 'super' }} data-target="closed">
                        {closedNotification == 0 ? null : closedNotification}
                      </span>
                    </span>
                  </li>
                  <li className="nav-item" onClick={handleTabClick}>
                    <span className={getNavLinkClass(drafts) + ` d-flex align-items-center`} data-target="drafts">
                      <img src={draftImg} alt="" data-target="drafts" />
                      Drafts
                      <span className="badge badge-danger ml-1" style={{ verticalAlign: 'super' }} data-target="drafts">
                        {draftsNotification == 0 ? null : draftsNotification}
                      </span>
                    </span>
                  </li>
                </ul>

                <div className="tab-content pt-4 pl-3 pr-3">
                  {completed ? (
                    <div className={getTabPaneClass(completed)} id="completed">
                      <Requests status={status.completed} />
                    </div>
                  ) : processing ? (
                    <div className={getTabPaneClass(processing)} id="processing">
                      <Requests status={status.processing} />
                    </div>
                  ) : returned ? (
                    <div className={getTabPaneClass(returned)} id="returned">
                      <Requests status={status.returned} />
                    </div>
                  ) : closed ? (
                    <div className={getTabPaneClass(closed)} id="closed">
                      <Requests status={status.closed} />
                    </div>
                  ) : drafts ? (
                    <div className={getTabPaneClass(drafts)} id="drafts">
                      <Requests status={status.drafts} />
                    </div>
                  ) : (
                    <div className={getTabPaneClass(pending)} id="pending">
                      <Requests status={status.pending} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestHistory;
