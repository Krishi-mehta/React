import React from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close"; // Import the Close icon

function ChatHeader({ title, file, onMenuClick, sidebarOpen, onRemoveFile }) { // Add onRemoveFile prop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1.5, sm: 2 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #efefef",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: { xs: "auto", sm: "64px", md: "72px" },
      }}
    >
      {/* Left Section - Menu Button & Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: { xs: 'auto', md: 'auto' },
          justifyContent: "flex-start",
          flexGrow: 0,
        }}
      >
        {!sidebarOpen && (
          <Tooltip title="Open Menu" enterDelay={500}>
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: "#767676",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "#efefef",
                },
                borderRadius: "50%",
                transition: "all 0.2s ease-in-out",
                p: { xs: 0.8, sm: 1.2 },
                mr: { xs: 0.5, sm: 1 },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Typography
          sx={{
            fontWeight: 700,
            color: "#e60023",
            letterSpacing: "-0.5px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: { xs: '1.1rem', md: '1.5rem' },
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right Section - File Display */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: { xs: 'auto', md: 'auto' },
          justifyContent: "flex-end",
          flexGrow: 0,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.8, sm: 1 },
            backgroundColor: file ? "#e60023" : "#efefef",
            border: "1px solid",
            borderColor: file ? "transparent" : "#e0e0e0",
            borderRadius: 25,
            transition: "all 0.2s ease",
            maxWidth: { xs: file ? "130px" : "160px", sm: file ? "220px" : "250px", md: file ? "270px" : "300px" }, // Adjust max-width when file is present to make space for X icon
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: file ? "pointer" : "default", // Cursor on Paper itself when file is present
            "&:hover": {
              backgroundColor: file ? "#cc001a" : "#e0e0e0",
              transform: file ? "scale(1.01)" : "none",
              boxShadow: file ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            },
          }}
        >
          <PictureAsPdfIcon
            sx={{
              color: file ? "#ffffff" : "#767676",
              fontSize: { xs: "0.9rem", sm: "1.2rem" },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: file ? "#ffffff" : "#767676",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              // flexGrow: 1, // Allow text to grow
              minWidth: 0, // Prevent text from forcing its width
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
            }}
          >
            {file ? file.name : "No PDF uploaded"}
          </Typography>

          {/* New: Close (X) icon for removing the file */}
          {file && onRemoveFile && ( // Only show if a file is present AND onRemoveFile prop is provided
            <Tooltip title="Remove PDF" enterDelay={500}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // Prevent Paper's click event if it has one
                  onRemoveFile();
                }}
                sx={{
                  color: "#ffffff", // White color on red background
                  ml: 0.5, // Small left margin
                  p: { xs: 0.2, sm: 0.4 }, // Smaller padding for a compact icon
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.2)", // Subtle white hover
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <CloseIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} /> {/* Small icon size */}
              </IconButton>
            </Tooltip>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default ChatHeader;