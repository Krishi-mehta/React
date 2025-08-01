import React from "react";
import { Box, Paper, Typography, Avatar, useTheme } from "@mui/material";
import { keyframes } from "@emotion/react";
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

// Keyframe animation for message entry
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Message = ({ message }) => {
  const theme = useTheme();
  const isUser = message.sender === "user";

  // Define colors with theme fallbacks
  const aiAvatarBg = theme.palette.primary.main || "#7247EE";
  const aiAvatarColor = theme.palette.primary.contrastText || "#ffffff";
  const userAvatarBg = theme.palette.action.hover || "#F1F1F1";
  const userAvatarColor = theme.palette.text.primary || "#343541";
  const userBubbleBg = theme.palette.grey[100] || "#EDEDED";
  const aiBubbleBg = theme.palette.background.paper || "#FFFFFF";
  const bubbleBorder = theme.palette.divider || "#E0E0E0";
  const textColor = theme.palette.text.primary || "#343541";
  const bubbleShadow = theme.shadows[1] || "0 1px 2px rgba(0, 0, 0, 0.05)";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        px: { xs: 1, sm: 2, md: 3 },
        mb: 2.5,
        animation: `${fadeIn} 0.4s ease-out`,
        width: "100%",
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: "flex",
          maxWidth: { xs: "80%", sm: "70%", md: "80%" },
          gap: 1.5,
          flexDirection: isUser ? "row-reverse" : "row",
        }}
      >
        {/* Avatar (User or AI) */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: 14,
            fontWeight: "bold",
            flexShrink: 0,
            bgcolor: isUser ? userAvatarBg : aiAvatarBg,
            color: isUser ? userAvatarColor : aiAvatarColor,
            boxShadow: "none",
            border: "none",
          }}
        >
          {isUser ? <PersonOutlineIcon fontSize="small" /> : <SmartToyOutlinedIcon fontSize="small" />}
        </Avatar>

        {/* Message Bubble */}
        <Paper
          sx={{
            p: 1.2,
            px: 2,
            maxWidth: "100%",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: 1.4,
            elevation: 0,
            backgroundColor: isUser ? userBubbleBg : aiBubbleBg,
            borderRadius: "10px",
            boxShadow: bubbleShadow,
            border: isUser ? "none" : `1px solid ${bubbleBorder}`,
            overflowWrap: 'break-word',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: 14, sm: 15 },
              color: textColor,
              fontWeight: 400,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {message.text}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Message;