// src/App.jsx
import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatContainer from "./features/ChatContainer";
// import { ThemeProvider, CssBaseline  } from '@mui/material';
import { theme } from './theme';

function App() {
  return (
    // <ThemeProvider theme={theme}>
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Routes>
        {/* Default route redirects to new chat */}
        <Route path="/" element={<Navigate to="/chat/new"  />} />

        {/* This is the change: use /chat/:chatId */}
        <Route path="/chat/:chatId" element={<ChatContainer />} />

        {/* Catch all other routes and redirect to new chat */}
        {/* Make sure this is AFTER your specific routes */}
        <Route path="*" element={<Navigate to="/chat/new"  />} />
      </Routes>
    </Box>
    // </ThemeProvider>
  );
}

export default App;