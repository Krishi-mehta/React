import React from "react";
import { Box, Paper, Typography, Avatar, useTheme } from "@mui/material";
import { keyframes } from "@emotion/react";
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTranslation } from 'react-i18next';

// Typing dots bounce animation
const bounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-4px); opacity: 1; }
`;

function LoadingMessage({ text }) {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Define colors with theme fallbacks
  const aiAvatarBg = theme.palette.primary.main || "#7247EE";
  const aiAvatarColor = theme.palette.primary.contrastText || "#ffffff";
  const messageBg = theme.palette.background.paper || "#FFFFFF";
  const messageBorder = theme.palette.divider || "#E0E0E0";
  const dotsColor = theme.palette.text.secondary || "#9CA3AF";
  const messageShadow = theme.shadows[1] || "0 1px 2px rgba(0, 0, 0, 0.05)";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 2.5,
        width: "100%",
        px: { xs: 1, sm: 2, md: 3, lg: 20 },
        boxSizing: 'border-box',
      }}
    >
      {/* AI Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: aiAvatarBg,
          color: aiAvatarColor,
          fontSize: "0.875rem",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <SmartToyOutlinedIcon fontSize="small" />
      </Avatar>

      {/* Loading Message Bubble */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2.2,
          maxWidth: { xs: "85%", sm: "70%", md: "60%" },
          borderRadius: "18px",
          border: `1px solid ${messageBorder}`,
          backgroundColor: messageBg,
          display: 'flex',
          alignItems: 'center',
          minHeight: '40px',
          boxShadow: messageShadow,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {text && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
                mr: 1,
              }}
            >
              {text}
            </Typography>
          )}
          {[0, 1, 2].map((dot, index) => (
            <Box
              key={index}
              sx={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: dotsColor,
                animation: `${bounce} 1.4s infinite`,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default LoadingMessage;