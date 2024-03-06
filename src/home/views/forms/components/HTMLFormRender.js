import React, { useEffect } from 'react';
import { ADMIN_USER, CLIENT_USER } from '../../../../config/values';
import Helmet from 'react-helmet';
import parse from 'html-react-parser';
import { useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';

const HTMLFormRender = (props) => {
  const type = props.type || null;
  const isEdit = props.isEdit || false;
  const memoValues = props.requestValues || [];
  const formData = props.formData.toString().replace(/\\n/g, ' ').replace(/\\/g, '') || '';
  const cssdata = props.css || '';
  const javascript = props.javascript || '';

  useEffect(() => {
    memoValues.forEach(({ name, value }) => {
      const elements = document.getElementsByName(name);
      if (elements.length !== 0) {
        elements.forEach((element) => {
          const elementType = element.type;

          if (elementType === 'checkbox') {
            if (value === 'true' || value === true) {
              element.setAttribute('checked', true);
            } else {
              element.removeAttribute('checked');
            }
          } else if (elementType === 'radio') {
            if (JSON.stringify(element.value) === value || element.value === value) {
              element.setAttribute('checked', true);
            } else {
              // element.setAttribute('checked', false);
            }
          } else if (elementType === 'file') {
            if (props.preview) {
              if (props.requestFiles && props.requestFiles[name].files.length > 0)
                if (`${name}` in props.requestFiles) {
                  let temp = name.replace('fileupload_', '');
                  if (document.getElementsByClassName(`${temp}_preview_p`).length > 0) {
                    document.getElementsByClassName(`${temp}_preview_p`)[0].textContent = document
                      .getElementById(`${temp}_preview`)
                      .getElementsByTagName('p')[0].innerHTML;
                  }
                  // if (document.getElementsByClassName(`${temp}_preview_img`).length > 0) {
                  //   document.getElementsByClassName(`${temp}_preview_img`)[0].src = document
                  //     .getElementById(`${temp}_preview`)
                  //     .getElementsByTagName('img')[0].src;
                  // }
                  // console.log(document.getElementById(`${temp}_preview`).getElementsByTagName('p')[0].innerHTML, 'GGG');
                }
            } else {
              // Display file icon if file is uploaded in the html form
              // const fileValue = JSON.parse(value);
              // element.setAttribute('id', 'bla');
              // element.outerHTML = `
              //   <div>
              //     <img src='file.png' width='40' height='40'/>
              //     <p>${fileValue?.filename}</p>
              //   </div>
              //   `;
              let temp = name.replace('fileupload_', '');
              if (document.getElementsByClassName(`${temp}_preview_p`).length > 0 && value) {
                document.getElementsByClassName(`${temp}_preview_p`)[0].textContent = JSON.parse(value).originalname;
              }
            }
          } else {
            if (props.preview) {
              element.value = value;
              element.checked = value;
            } else {
              element.value = JSON.parse(value);
              element.checked = JSON.parse(value);
            }
          }
        });
      }
    });
  }, [memoValues, isEdit, type]);

  if (javascript && javascript.length > 0) {
    const htm = parse(formData) + javascript;
    return (
      <>
        <InnerHTML html={htm} />
        {/* <Helmet>
          <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
          <script>{javascript}</script>
        </Helmet>
        <div
          dangerouslySetInnerHTML={{
            __html: '<html><head><style>' + cssdata + '</style></head><body>' + parse(formData) + '</body> </html>',
          }}
        /> */}
      </>
    );
  } else {
    return (
      <>
        <div
          dangerouslySetInnerHTML={{
            __html: '<html><head><style>' + cssdata + '</style></head><body>' + parse(formData) + '</body> </html>',
          }}
        />
      </>
    );
  }
};

export default HTMLFormRender;
