import React from "react";
import { Box, Paper, Button, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { Menu } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import LoadingMessage from "../components/LoadingMessage";

const ACCENT_COLOR_UPLOAD = "#4F46E5";
const ACCENT_COLOR_UPLOAD_HOVER = "#4338CA";

function NewChatView({
  chats,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onNewChat,
  onChatSelect,
  onEditChatTitle,
  onDeleteChat,
  loading,
  dragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInputChange,
  t,
}) {
  const theme = useTheme();

  const getThemeColors = () => ({
    uploadBg: theme.palette.mode === 'dark' ? '#2D2D2D' : '#F9FAFB',
    uploadBgHover: theme.palette.mode === 'dark' ? '#3A3A3A' : '#F3F4F6',
    uploadBgDrag: theme.palette.mode === 'dark' ? '#404040' : '#F3F4F6',
    borderDefault: theme.palette.mode === 'dark' ? '#4A4A4A' : '#E5E7EB',
    borderDrag: ACCENT_COLOR_UPLOAD,
    titleColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
    descriptionColor: theme.palette.mode === 'dark' ? '#D1D5DB' : '#6B7280',
    iconBg: theme.palette.mode === 'dark' ? '#3730A3' : '#EEF2FF',
    menuBg: theme.palette.mode === 'dark' ? '#2D2D2D' : '#f1f3f4',
    menuBgHover: theme.palette.mode === 'dark' ? '#3A3A3A' : '#e8eaed',
    menuColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#5f6368',
    menuColorHover: theme.palette.mode === 'dark' ? '#FFFFFF' : '#202124',
    menuBorder: theme.palette.mode === 'dark' ? '#4A4A4A' : '#dadce0',
  });

  const colors = getThemeColors();

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        bgcolor: "transparent",
        position: "relative",
        px: 3,
        height: "100%",
        boxSizing: "border-box",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {(!sidebarOpen || isMobile) && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10,
          }}
        >
          <Button
            onClick={() => setSidebarOpen(true)}
            sx={{
              minWidth: "auto",
              p: 1.5,
              bgcolor: colors.menuBg,
              color: colors.menuColor,
              "&:hover": {
                bgcolor: colors.menuBgHover,
                color: colors.menuColorHover,
              },
              borderRadius: 2,
              border: `1px solid ${colors.menuBorder}`,
            }}
          >
            <Menu />
          </Button>
        </Box>
      )}

      <Box sx={{ textAlign: "center", maxWidth: "700px", width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            border: dragOver
              ? `2px solid ${colors.borderDrag}`
              : `2px dashed ${colors.borderDefault}`,
            borderRadius: "12px",
            p: 6,
            mb: 4,
            bgcolor: dragOver ? colors.uploadBgDrag : colors.uploadBg,
            transition: "all 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              borderColor: ACCENT_COLOR_UPLOAD,
              bgcolor: colors.uploadBgHover,
            },
            maxWidth: "600px",
            mx: "auto",
          }}
          onClick={() => document.getElementById("file-upload-button").click()}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: colors.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <CloudUpload sx={{ fontSize: 40, color: ACCENT_COLOR_UPLOAD }} />
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: colors.titleColor,
              fontWeight: 600,
              mb: 1.5,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              lineHeight: "28px",
            }}
          >
            {t('chat.startNewChat')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: colors.descriptionColor,
              mb: 3,
              lineHeight: "24px",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {t('chat.dragDropFiles')}
          </Typography>

          <input
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            style={{ display: "none" }}
            id="file-upload-button"
            type="file"
            onChange={handleFileInputChange}
          />

          <Button
            variant="contained"
            sx={{
              bgcolor: ACCENT_COLOR_UPLOAD,
              "&:hover": { bgcolor: ACCENT_COLOR_UPLOAD_HOVER },
              py: 1.2,
              px: 3.5,
              fontSize: "0.875rem",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              color: "#FFFFFF",
            }}
            disabled={loading}
          >
            {t('chat.uploadDocumentOrImage')}
          </Button>
        </Paper>

        {loading && <LoadingMessage text={t('chat.processingFile')} />}
      </Box>
    </Box>
  );
}

export default NewChatView;