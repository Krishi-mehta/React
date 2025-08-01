// src/App.jsx
import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatContainer from "./features/ChatContainer";

function App() {
  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Routes>
        {/* Default route redirects to new chat */}
        <Route path="/" element={<Navigate to="/chat/new" replace />} />

        {/* This is the change: use /chat/:chatId */}
        <Route path="/chat/:chatId" element={<ChatContainer />} />

        {/* Catch all other routes and redirect to new chat */}
        {/* Make sure this is AFTER your specific routes */}
        <Route path="*" element={<Navigate to="/chat/new" replace />} />
      </Routes>
    </Box>
  );
}

export default App;