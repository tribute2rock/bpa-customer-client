import React from 'react';
import { toast } from 'react-toastify';
import themeData from '../../config/theme';
import GenLogo from '../../img/GenTechLogo.png';

const Footer = () => (
  <>
    <section className="footer-top">
      <div className="container ">
        <div className="row mt-md-3 justify-content-center">
          <div className="col-md-3">
            <h5 className="font-weight-normal mb-3">Quick Links</h5>
            <a target="_blank" href="https://globalimebank.com/reports/annual-report.html" className="d-block text-light">
              Annual Report
            </a>
            <a target="_blank" href="https://globalimebank.com/requestForm.html" className="d-block text-light">
              Online Customer Request Form
            </a>
          </div>
          <div className="col-md-3">
            <h5 className="font-weight-normal mb-3">We are Recognized</h5>
            <div className="recognization_logo mt-3">
              <img
                src="https://globalimebank.com/assets/upload/images/footer/logoicra.png"
                className="img-fluid"
                style={{ height: '40px', marginRight: '5px', padding: '2px', backgroundColor: 'white' }}
              />
              <img
                src="https://globalimebank.com/assets/upload/images/footer/ezgif.com-webp-to-jpg_.jpg"
                className="img-fluid "
                style={{ height: '40px', marginRight: '5px', padding: '2px', backgroundColor: 'white' }}
              />

              <img
                src="https://globalimebank.com/assets/upload/images/footer/ezgif.com-webp-to-jpg2_.jpg"
                className="img-fluid"
                style={{ height: '40px', marginRight: '5px', padding: '2px', backgroundColor: 'white' }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <h5 className="font-weight-normal mb-3">E-Payment Partner</h5>
            <img
              src="https://globalimebank.com/assets/upload/images/footer/ime_pay1.jpg"
              alt=""
              class="img-fluid"
              style={{ width: '84px', backgroundColor: 'white' }}
            />
            <br />
            <img src="https://globalimebank.com/assets/upload/images/footer/esewa.png" alt="" class="img-fluid mt-3" />
          </div>
          <div className="col-md-3">
            <h5 className="font-weight-normal mb-3"> Contact Information</h5>
            <p>
              Kamaladi, Kathmandu, Nepal
              <br /> P.O. Box: 19327
              <br />
              Phone No: +977-1-4226247+977-1-4228671
              <br />
              Fax: +977-1-4228036
              <br />
              Email: info@gibl.com.np
              <br />
              Swift: GLBBNPKA
            </p>
          </div>
        </div>
      </div>
    </section>
    <section className="footer-btm container-fluid">
      <div className="row align-items-center">
        <div className="col-md-4">
          <div className="footer-links">
            <a target="_blank" href="https://globalimebank.com/feedback.html">
              Feedback
            </a>
            <a target="_blank" href="https://globalimebank.com/privacy-policy.html">
              Privacy Policy
            </a>
            <a target="_blank" href="https://globalimebank.com/disclaimer.html">
              Disclaimer
            </a>
          </div>
        </div>
        <div className="col-md-4">
          <div className="footer-copyright">
            <p>Global IME Bank | © Copyright 2022. All rights reserved. </p>
          </div>
        </div>
        <div className="col-md-4">
          <p className="m-0">
            Powered by
            <a href="https://generaltechnology.com.np" target="_blank" className="text-light">
              <img
                src={GenLogo}
                alt="General Technology Logo"
                style={{
                  width: '120px',
                  marginLeft: '8px',
                  backgroundColor: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '5px',
                }}
              />
            </a>
          </p>
        </div>
      </div>
    </section>
  </>
);

export default Footer;