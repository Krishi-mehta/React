// src/main.jsx (or src/index.js)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App' // Keep this import path as is
// import theme from './theme';
import { BrowserRouter } from 'react-router-dom'; // IMPORT BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <ThemeProvider theme={theme}> */}
      <CssBaseline />
      {/* WRAP App COMPONENT WITH BrowserRouter */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    {/* </ThemeProvider> */}
  </StrictMode>,
)