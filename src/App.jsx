// src/App.jsx
import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatContainer from "./features/ChatContainer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
// import { ThemeProvider, CssBaseline  } from '@mui/material';
import { theme } from './theme';

function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider theme={theme}> */}
        <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/chat/new" />
              </ProtectedRoute>
            } />
            
            <Route path="/chat/:chatId" element={
              <ProtectedRoute>
                <ChatContainer />
              </ProtectedRoute>
            } />
            
            {/* Catch all other routes */}
            <Route path="*" element={
              <ProtectedRoute>
                <Navigate to="/chat/new" />
              </ProtectedRoute>
            } />
          </Routes>
        </Box>
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}

export default App;


// Krishi@87github