import React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';

const FormField = ({ label, inputRef, maxLength, ...inputProps }) => (
  <label>
    {label}
    <OutlinedInput
      inputRef={inputRef}
      slotProps={{ input: { maxLength } }}
      {...inputProps}
    />
  </label>
);

export default FormField;
