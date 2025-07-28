import React from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

function ChatHeader({ title, file, onMenuClick, sidebarOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // sm = 600px

  return (
    <Box
      sx={{
        px: isMobile ? 1 : 3,
        py: isMobile ? 1 : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e0e0e0",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 1 : 0,
        textAlign: isMobile ? "center" : "left",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        width={isMobile ? "100%" : "auto"}
        justifyContent={isMobile ? "center" : "flex-start"}
      >
        {!sidebarOpen && (
          <IconButton onClick={onMenuClick} size={isMobile ? "small" : "medium"}>
            <MenuIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        )}

        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          sx={{ ml: 1, fontWeight: 600 }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        justifyContent={isMobile ? "center" : "flex-end"}
        width={isMobile ? "100%" : "auto"}
      >
        <Typography
          sx={{
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            fontSize: isMobile ? "0.75rem" : "0.875rem",
          }}
        >
          <PictureAsPdfIcon
            sx={{
              mr: 0.5,
              fontSize: isMobile ? "1rem" : "1.25rem",
              color: file ? "green" : "inherit",
            }}
          />
          {file ? file.name : "No PDF uploaded"}
        </Typography>
      </Box>
    </Box>
  );
}

export default ChatHeader;
