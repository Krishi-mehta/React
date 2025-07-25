import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

function ChatHeader({ title, file, onMenuClick,sidebarOpen }) {
  return (
    <Box 
      sx={{ 
        px: 3, py: 2,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        borderBottom: "1px solid #e0e0e0"
      }}
    >
      <Box display="flex" alignItems="center">
      {!sidebarOpen && ( 
          <IconButton onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ ml: 2 }}>
          {title}
        </Typography>
      </Box>
      
      <Box display="flex" alignItems="center" >
        <Typography sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}>
          <PictureAsPdfIcon sx={{ 
            mr: 0.5, 
            fontSize: "1rem", 
            color: file ? "green" : "inherit" 
          }} />
          {file ? file.name : "No PDF uploaded"}
        </Typography>
      </Box>
    </Box>
  );
}

export default ChatHeader;