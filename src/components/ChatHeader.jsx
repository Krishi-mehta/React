import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ErrorIcon from "@mui/icons-material/Error";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

import FilePreview from "./FilePreview";
import LanguageDropdown from "./LanguageDropdown";

function ChatHeader({
  title,
  file,
  fileData,
  onMenuClick,
  onRemoveFile,
  sidebarOpen,
  processingComplete = true,
  processingError = false,
  selectedLanguage,
  onLanguageChange,
}) {
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  // Safe color access with fallbacks
  const chipBackground = theme.palette.custom?.chipBackground || "#6366F1";
  const chipHoverBackground =
    theme.palette.custom?.chipHoverBackground || "#5A5FE0";

  const getFileIcon = (fileType) => {
    if (fileType && fileType.startsWith("image/")) {
      return (
        <ImageIcon sx={{ color: "white !important", fontSize: "1.2rem" }} />
      );
    }
    return (
      <PictureAsPdfIcon
        sx={{ color: "white !important", fontSize: "1.2rem" }}
      />
    );
  };

  const getProcessingIcon = () => {
    if (processingError) {
      return (
        <ErrorIcon
          sx={{ color: "white !important", fontSize: "1rem", ml: 0.5 }}
        />
      );
    }
    if (!processingComplete) {
      return (
        <CircularProgress
          size={16}
          sx={{ color: "white !important", ml: 0.5 }}
        />
      );
    }
    return null;
  };

  const handlePreviewClick = () => {
    if (processingComplete && !processingError) {
      setFilePreviewOpen(true);
    }
  };

  const handleRemoveFile = () => {
    if (onRemoveFile) {
      onRemoveFile();
    }
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
        minHeight: "64px",
        boxSizing: "border-box",
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
          <Tooltip title={t("sidebar.toggleSidebar")} enterDelay={500}>
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: theme.palette.text.disabled,
                p: "8px",
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
                borderRadius: "50%",
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
            fontSize: { xs: "1rem", sm: "1.125rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Right Section - Language Dropdown, File Chip, Preview Button and Remove Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          gap: 1.5,
        }}
      >
        {/* Language Dropdown */}
        <LanguageDropdown
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
        />

        {file && (
          <>
            {/* Preview Button */}
            <Tooltip 
              title={
                !processingComplete 
                  ? t("file.processingInProgress")
                  : processingError 
                  ? t("file.processingError")
                  : t("file.preview")
              }
            >
              <span>
                <IconButton
                  onClick={handlePreviewClick}
                  disabled={!processingComplete || processingError}
                  sx={{
                    color: processingComplete && !processingError 
                      ? theme.palette.primary.main 
                      : theme.palette.action.disabled,
                    bgcolor: theme.palette.action.hover,
                    "&:hover": {
                      bgcolor: processingComplete && !processingError 
                        ? theme.palette.action.selected 
                        : theme.palette.action.hover,
                    },
                    "&:disabled": {
                      color: theme.palette.action.disabled,
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                  size="small"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {/* File Chip */}
            <Chip
              icon={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {getFileIcon(file.type)}
                  {getProcessingIcon()}
                </Box>
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <span>{file.name}</span>
                  {!processingComplete && !processingError && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.7rem",
                      }}
                    >
                      Processing...
                    </Typography>
                  )}
                  {processingError && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.7rem",
                      }}
                    >
                      Error
                    </Typography>
                  )}
                </Box>
              }
              // onDelete={handleRemoveFile}
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
                height: "38px",
                maxWidth: { xs: "120px", sm: "180px", md: "250px" },
                borderRadius: "8px",
                px: "10px",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                },
                "& .MuiChip-icon": {
                  marginLeft: "6px",
                  marginRight: "2px",
                },
                "& .MuiChip-deleteIcon": {
                  color: "white",
                  fontSize: "0.9rem",
                  marginRight: "6px",
                  marginLeft: "2px",
                  "&:hover": {
                    color: theme.palette.background.default,
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                },
                "&:hover": {
                  bgcolor: chipHoverBackground,
                },
                transition: theme.transitions.create(["background-color"], {
                  duration: theme.transitions.duration.short,
                }),
              }}
            />
          </>
        )}
      </Box>

      {/* File Preview Component */}
      {file && (
        <FilePreview
          open={filePreviewOpen}
          onClose={() => setFilePreviewOpen(false)}
          file={{ ...file, data: fileData }}
        />
      )}
    </Box>
  );
}

export default ChatHeader;