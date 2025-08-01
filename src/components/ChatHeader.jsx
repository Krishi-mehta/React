import React from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// import CloseIcon from "@mui/icons-material/Close";

function ChatHeader({ title, file, onMenuClick, sidebarOpen}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Safe color access with fallbacks
  const chipBackground = theme.palette.custom?.chipBackground || "#6366F1";
  const chipHoverBackground = theme.palette.custom?.chipHoverBackground || "#5A5FE0";

  const getFileIcon = (fileType) => {
    return <PictureAsPdfIcon sx={{ color: "white !important", fontSize: '1.2rem' }} />;
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 1.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        minHeight: '64px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left Section - Menu Button & Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Menu Icon */}
        {(isMobile || !sidebarOpen) && (
          <Tooltip title="Open Menu" enterDelay={500}>
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: theme.palette.text.disabled,
                p: '8px',
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
                borderRadius: '50%',
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Title */}
        <Typography
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
            fontSize: { xs: '1rem', sm: '1.125rem' },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right Section - File Chip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          gap: 1.5,
        }}
      >
        {file && (
          <Chip
            icon={getFileIcon(file.type)}
            label={file.name}
            // onDelete={onRemoveFile}
            // deleteIcon={
            //   <CloseIcon
            //     sx={{
            //       color: "white !important",
            //       fontSize: '0.9rem',
            //       "&:hover": {
            //         color: `${theme.palette.background.default} !important`,
            //       },
            //     }}
            //   />
            // }
            sx={{
              bgcolor: chipBackground,
              color: "white",
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              height: '38px',
              maxWidth: { xs: "120px", sm: "180px", md: "250px" },
              borderRadius: '8px',
              px: '10px',
              '& .MuiChip-label': {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingLeft: '4px',
                paddingRight: '4px',
              },
              '& .MuiChip-icon': {
                marginLeft: '6px',
                marginRight: '2px',
              },
              "& .MuiChip-deleteIcon": {
                color: "white",
                fontSize: '0.9rem',
                marginRight: '6px',
                marginLeft: '2px',
                "&:hover": {
                  color: theme.palette.background.default,
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              },
              "&:hover": {
                bgcolor: chipHoverBackground,
              },
              transition: theme.transitions.create(['background-color'], {
                duration: theme.transitions.duration.short,
              }),
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default ChatHeader;