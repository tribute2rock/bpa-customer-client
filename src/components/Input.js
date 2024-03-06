import React from 'react';

export default function Input({ title, value, type, errors = {}, name, placeholder, ...rest }) {
  return (
    <div className="form-group">
      <label for={name}>{title}</label>
      <input type={type} name={name} value={value} className="form-control" placeholder={placeholder} {...rest} />
      <p>
        {errors[name]?.map((err) => (
          <span style={{ color: 'red' }}>{err}</span>
        ))}
      </p>
    </div>
  );
}
