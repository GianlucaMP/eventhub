import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StyledEngineProvider injectFirst>
    <App />
  </StyledEngineProvider>
);
