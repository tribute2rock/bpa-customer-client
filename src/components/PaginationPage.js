import React from 'react';
import { pageSizes } from '../constants/values';
import { Pagination } from '@material-ui/lab';

const PaginationPage = props => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-4 ">
      <div className="form-inline">
        <span>{'Items Per Page : '}</span>
        <select className="form-control ml-2" onChange={props.handlePageSizeChange} value={props.pageSize}>
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="d-inline">
        {'Showing '} {props.offset + 1}
        {' - '}
        {props.offset + props.pageSize} of {props.totalItems}
      </div>
      <div className="d-inline">
        <Pagination
          className="my-3 "
          count={props.totalPages}
          page={props.page}
          siblingCount={1}
          boundaryCount={1}
          variant="outlined"
          shape="rounded"
          onChange={props.handlePageChange}
        />
      </div>
    </div>
  );
};

export default PaginationPage;
