import React from 'react';
import MuiButton from '@mui/material/Button';

const Button = ({ variant = 'primary', type = 'button', ...props }) => (
  <MuiButton
    type={type}
    className={variant === 'secondary' ? 'secondary-button' : 'primary-button'}
    {...props}
  />
);

export default Button;
