import React, { useEffect, useState } from 'react';
import { getDataByCategoryId } from './api/category';
import A from '../../../config/url';
import { toast } from 'react-toastify';
import metaRoutes from '../../../config/meta_routes';
import query from 'querystring';
import { Link, Redirect } from 'react-router-dom';

const Subcategory = (props) => {
  const [subcategories, setSubCategories] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const qs = query.parse(props.location.search);
  const id = A.getId(qs['?i']);
  useEffect(() => {
    getDataByCategoryId(id, (err, data) => {
      if (err) toast.error('Error!');
      else {
        setSubCategories(data.data.subCategories);
        if (data.data.subCategories.length > 0) {
        } else {
          setRedirect(true);
        }
      }
    });
  }, [id]);
  return (
    <div className="content-section">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="landing.html">Main Category</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Sub-Category
          </li>
        </ol>
      </nav>
      <h6 className="page-title">
        Please Select Sub Category
        <input
          type="text"
          className="form-control float-right"
          placeholder="Search"
          style={{
            width: '220px',
            marginTop: '-10px',
            marginRight: '-10px',
          }}
        />
      </h6>
      <div className="row">
        {subcategories &&
          subcategories.map((subCategory, index) =>
            subCategory.isActive ? (
              <div className="col-md-4" key={index}>
                <Link to={metaRoutes.formLists + '?i=' + A.getHash(subCategory.id)} className="content-item">
                  <h2>{subCategory.name}</h2>
                </Link>
              </div>
            ) : null
          )}
        {redirect ? <Redirect to={metaRoutes.formLists + '?i=' + A.getHash(id)} /> : null}
      </div>
    </div>
  );
};

export default Subcategory;
