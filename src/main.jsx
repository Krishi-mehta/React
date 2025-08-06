// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import App from './App'
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import './i18n'; // Initialize i18n
// import { ThemeProvider } from "@mui/material/styles";
// import { lightTheme, darkTheme } from "./theme";

createRoot(document.getElementById('root')).render(
  <StrictMode>

    {/* <ThemeProvider theme={lightTheme} theme={darkTheme}> */}
    <Provider store={store}>
      <CssVarsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CssVarsProvider>
    </Provider>
    {/* </ThemeProvider> */}
  </StrictMode>,
)




