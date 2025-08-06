import {React,useState,useMemo} from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatContainer from "./features/ChatContainer";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider} from '@mui/material';
import Sidebar from "./components/Sidebar";
import { lightTheme, darkTheme } from "./theme";
import { ThemeModeProvider } from './contexts/ThemeModeContext';
// import I18nTest from "./components/I18nTest";

function AppContent() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);
  const { currentUser, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh" 
      }}>
        Loading...
      </Box>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
        {/* Only show sidebar if user is authenticated and not on login page */}
        {currentUser && <Sidebar mode={mode} setMode={setMode} />}
        
        {/* Temporary i18n test new component */}
        {/* <I18nTest /> */}
        
        <Routes>
          {/* Public route for login */}
          <Route 
            path="/login" 
            element={
              currentUser ? <Navigate to="/chat/new" replace /> : <Login />
            } 
          />
          
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
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeModeProvider>
        <AppContent />
      </ThemeModeProvider>
    </AuthProvider>
  );
}

export default App;