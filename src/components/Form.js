import { LoadingOverlay } from '@mantine/core';
import React, { Children } from 'react';

export default function Form({ onSubmit, onChange, loading = false, ...rest }) {
  return (
    <form onSubmit={onSubmit} onChange={onChange} {...rest}>
      <LoadingOverlay visible={loading} />

      {Children}
    </form>
  );
}
