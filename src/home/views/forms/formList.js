import React, { useEffect, useState } from 'react';
import { getFormsByCatId, getSearch } from './api/form';
import A from '../../../config/url';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import query from 'querystring';
import metaRoutes from '../../../config/meta_routes';

const FormList = (props) => {
  const [formsList, setFormsList] = useState([]);
  const [searchFormsList, setSearchFormsList] = useState([]);
  const [buttonStatus, setButtonStatus] = useState(true);
  const [search, setSearch] = useState('?search?');
  const [categoryName, setCategoryName] = useState();
  const qs = query.parse(props.location.search);
  const id = A.getId(qs['?i']);
  const cName = qs['?s'];

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value.trim();
    setSearch({ ...search, [name]: value });

    const searchName = search.search;
    if (!searchName && searchName.length <= 0) {
      toast.error('Empty search field');
    } else {
      getSearch(
        {
          query: searchName,
          categoryId: id,
        },
        (err, data) => {
          if (err) {
            toast.error('Failed to search forms.');
          } else {
            if (data.length == 0) {
              toast.error('Search results are empty.');
            } else {
              setSearchFormsList(data);
              setButtonStatus(false);
            }
          }
        }
      );
    }
  };

  useEffect(() => {
    getFormsByCatId(id, (err, data) => {
      if (err) toast.error('Error!');
      else {
        setFormsList(data.data.formid);
        setCategoryName(data.data.catName.name);
      }
    });
  }, [id]);

  return (
    <div className="content-section">
      <h6 className="page-title clearfix">
        {categoryName}
        <br />
        <small style={{ textTransform: 'capitalize' }}>Please Select Form</small>
        {/* <span>
          {buttonStatus ? (
            <button
              type="button"
              class="btn btn-warning pull-right"
              onClick={handleSearch}
              style={{
                marginTop: '-6px',
              }}
            >
              Search
            </button>
          ) : (
            <button
              type="button"
              class="btn btn-warning pull-right"
              onClick={handleBack}
              style={{
                marginTop: '-6px',
              }}
            >
              Back
            </button>
          )}
        </span> */}
        {/* <input
          type="text"
          name="search"
          className="form-control pull-right"
          onChange={handleChange}
          placeholder="Search"
          style={{
            width: '220px',
            marginTop: '-10px',
            marginRight: '10px',
          }}
        /> */}
        <div className="float-right">
          <div className="input-group align-items-center">
            <Link
              to={{
                pathname: metaRoutes.home,
              }}
              className="btn text-dark btn-light btn-sm mr-1 text-capitalize"
            >
              <i className="fa fa-chevron-left text-danger"></i> Go Back
            </Link>
          </div>
        </div>
      </h6>
      {searchFormsList.length == 0 ? (
        <div className="row">
          {formsList.map((formsListOutput, index) =>
            formsListOutput.isActive ? (
              <div className="col-md-4" key={index}>
                <Link
                  to={{
                    pathname: metaRoutes.form,
                    search: '?i=' + A.getHash(formsListOutput.id),
                    state: { fromHome: '?i=' + A.getHash(formsListOutput.id) },
                  }}
                  className="content-item form-list"
                >
                  <i className="fa fa-file-alt" />
                  <h2>{formsListOutput.name}</h2>
                </Link>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className="row">
          {searchFormsList.map((formsListOutput, index) =>
            formsListOutput.isActive ? (
              <div className="col-md-4" key={index}>
                <Link
                  to={{
                    pathname: metaRoutes.form,
                    search: '?i=' + A.getHash(formsListOutput.id),
                    state: { fromHome: '?i=' + A.getHash(formsListOutput.id) },
                  }}
                  className="content-item"
                >
                  <h2>{formsListOutput.name}</h2>
                </Link>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default FormList;
