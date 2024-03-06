import React, { useMemo } from 'react';
import Dropzone, { useDropzone } from 'react-dropzone';

import File from './File';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

const CustomDropzone = (props) => {
  const { acceptedFiles, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept:
      'image/*,application/pdf,.doc,.docx,application/msword,.txt,.text,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xlsx,.xls',
    onDrop: props.onDrop,
  });

  // props.selectFiles(acceptedFiles);

  const files = acceptedFiles.map((file, index) => (
    <File
      fileKey={`key-accepted-file-${index}`}
      toolTipId={`accepted-file-${index}`}
      fileName={file.path}
      fileFullName={file.path}
      fileType={file.type}
      fileSize={file.size}
    />
  ));

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <>
      <div>
        <Dropzone onDrop={props.onDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className=" font-weight-bolder">Drag and drop files here, or click to select files</p>
            </div>
          )}
        </Dropzone>

        {props.selectFiles.length > 0 && (
          <div className="border-1" style={{ fontSize: '12px' }}>
            {/* <h5 className=" font-weight-bold">Selected Files:</h5> */}
            <ul>
              {props.selectFiles.map((file, index) => (
                <li key={file.name}>
                  {file.name} - {file.size} bytes
                  <button
                    onClick={() => props.onFileRemove(index)}
                    style={{ outline: 'none', border: 'none', marginLeft: '5px' }}
                  >
                    <span className="fa fa-times text-danger"></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomDropzone;
