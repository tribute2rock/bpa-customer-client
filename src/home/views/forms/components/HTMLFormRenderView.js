import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import InnerHTML from 'dangerously-set-html-content';

const HTMLFormRenderView = (props) => {
  const [data, setData] = useState({});
  const type = props.type || null;
  const isEdit = props.isEdit || false;
  const memoValues = props.requestValues || [];
  let formData = props?.formData?.toString().replace(/\\n/g, ' ').replace(/\\/g, '') || '';
  const cssdata = props.css || '';
  const javascript = props.javascript || '';

  if (props.printform) {
    formData = formData.replace(/col-sm-12/g, 'col-sm-6');
  }

  useEffect(() => {
    const convertedValue = {};
    memoValues?.forEach((item) => {
      convertedValue[item.name] = item.value ? JSON.parse(item.value) : null;
    });
    setData(convertedValue);

    if (convertedValue.date_from) {
      const validityPeriodElement = getElementByName('validity_period');
      if (validityPeriodElement) {
        if (validityPeriodElement.closest('.align-items-center')) {
          validityPeriodElement.closest('.align-items-center').style.display = 'none';
        }
      }
    }

    if (convertedValue.validity_period) {
      const element = getElementByName('date_from');
      if (element) {
        if (element.closest('.row')) {
          element.closest('.row').style.display = 'none';
        }
      }

      if (convertedValue.validity_date_type) {
        const element = getElementByName('validity_period_date');
        if (element) {
          console.log(element);
          const newInput = document.createElement('div');
          newInput.classList.add('form-group');
          newInput.classList.add('form-control');
          newInput.style.border = '1px solid #E4E6EF';
          newInput.textContent = convertedValue.validity_date_type;
          element.parentNode.insertBefore(newInput, element.nextSibling);
          element.parentNode.removeChild(element);
        }
      }
    }

    if (convertedValue?.claim_validity_type === 'Type One') {
      const claimValidityElement = getElementByName('claim_validity_period');
      if (claimValidityElement) {
        if (claimValidityElement.closest('.col-7')) {
          claimValidityElement.closest('.col-7').style.display = 'none';
        }
      }
    }

    if (convertedValue?.claim_validity_type === 'Type Two') {
      const claimValidityElement = document.getElementById('claim_validity');
      if (claimValidityElement) {
        if (claimValidityElement.closest('.col-5')) {
          claimValidityElement.closest('.col-5').style.display = 'none';
        }
      }
    }

    if (convertedValue?.expiry_date === '') {
      const expiryDateElement = getElementByName('expiry_date');
      if (expiryDateElement) {
        if (expiryDateElement.closest('.col-12')) {
          expiryDateElement.closest('.col-12').style.display = 'none';
        }
      }
    }

    if (convertedValue?.validity_period_select === '') {
      const expiryDateElement = getElementByName('validity_period_select');
      if (expiryDateElement) {
        if (expiryDateElement.closest('.col-10')) {
          expiryDateElement.closest('.col-10').style.display = 'none';
        }
      }
    }
  }, [memoValues]);

  function getElementByName(elementName) {
    let elements = document.getElementsByName(elementName);
    if (elements.length > 0) {
      return elements[0];
    } else {
      return null;
    }
  }

  useEffect(() => {
    const counterGuaranteeForm = document.querySelector('.counter-guarantee-form');
    if (counterGuaranteeForm) {
      const firstChild = counterGuaranteeForm.firstElementChild;
      if (firstChild) {
        firstChild.classList.add('col-11');
      }
    }

    memoValues.forEach(({ name, value }) => {
      const elements = document.getElementsByName(name);
      if (elements.length !== 0) {
        elements.forEach((element) => {
          const elementType = element.type;
          element.style.border = '1px solid #E4E6EF';
          if (elementType === 'checkbox') {
            if (value === 'true' || value === true) {
              element.setAttribute('checked', true);
            } else {
              element.removeAttribute('checked');
              element.closest('.form-check').style.display = 'none';
            }
          } else if (elementType === 'radio') {
            if (JSON.stringify(element.value) === value || element.value === value) {
              element.setAttribute('checked', true);
            } else {
              element.closest('div').style.display = 'none';
            }
            element.style.display = 'none';
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
                }
            } else {
              let temp = name.replace('fileupload_', '');
              if (document.getElementsByClassName(`${temp}_preview_p`).length > 0) {
                document.getElementsByClassName(`${temp}_preview_p`)[0].textContent = JSON.parse(value).originalname;
              }
            }
          } else if (elementType === 'date') {
            if (value === '""') {
              element.closest('div').style.display = 'none';
            }
            element.setAttribute('style', ' -webkit-appearance: none;');
            element.type = 'text';
            element.value = value.replace(/"/g, '');
            element.value = new Date(element.value).toDateString().replace(/^\w+\s/, '');
          } else if (elementType === 'select-one') {
            if (props.preview) {
              if (value === '""') {
                element.closest('row').style.display = 'none';
              } else if (value.startsWith('"') && value.endsWith('"')) {
                const cleanedValue = value.substring(1, value.length - 1); // Remove surrounding quotes
                element.value = cleanedValue;
              } else {
                element.value = value;
              }
            } else {
              element.value = JSON.parse(value);
              element.checked = JSON.parse(value);
            }
          }else {
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

export default HTMLFormRenderView;