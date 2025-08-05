// src/App.jsx
import {React,useState,useMemo} from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatContainer from "./features/ChatContainer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider} from '@mui/material';
import Sidebar from "./components/Sidebar";
// import { theme } from './theme';
import { lightTheme, darkTheme } from "./theme";
import { ThemeModeProvider } from './contexts/ThemeModeContext';

function App() {

  const [mode, setMode] = useState("light");
  const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);
  
  return (
    <AuthProvider>
       <ThemeModeProvider>
      <ThemeProvider theme={theme}>

      
        <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>

          <Sidebar mode={mode} setMode={setMode} />
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
                <ChatContainer mode={mode} setMode={setMode} />
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
      </ThemeProvider>
      </ThemeModeProvider>
    </AuthProvider>
  );
}

export default App;


// Krishi@87github