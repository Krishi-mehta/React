import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import { keyframes } from "@emotion/react";
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'; // Ensure this is imported
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // Ensure this is imported

// Keyframe animation for message entry (Keeping as is)
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
  const isUser = message.sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        // EXACTLY AS PROVIDED: px, mb, animation, width
        px: { xs: 1, sm: 2, md: 10, lg: 25 },
        mb: 2.5,
        animation: `${fadeIn} 0.4s ease-out`,
        width: "100%",
        boxSizing: 'border-box', // Ensure padding is included in width
      }}
    >
      <Box
        sx={{
          display: "flex",
          // Changed from flex-end to center to vertically align avatars with the pill bubble
          alignItems: "center", // This is a visual alignment change, not a dimension change
          // EXACTLY AS PROVIDED: maxWidth, gap, flexDirection
          maxWidth: { xs: "90%", sm: "80%", md: "70%" },
          gap: 1.2,
          flexDirection: isUser ? "row-reverse" : "row",
        }}
      >
        {/* Avatar (User or AI) - Pinterest Visual Style */}
        <Avatar
          sx={{
            // EXACTLY AS PROVIDED: width, height, fontSize, fontWeight, flexShrink
            width: 38,
            height: 38,
            fontSize: 14,
            fontWeight: "bold",
            flexShrink: 0,
            // Pinterest-specific visual changes
            // Using subtle grey for user avatar, Pinterest Red for AI avatar
            bgcolor: isUser ? "#efefef" : "#e60023",
            // Dark grey icon for user, white for AI
            color: isUser ? "#767676" : "#ffffff",
            boxShadow: "none", // No shadow for flat Pinterest look
            border: "none", // No border for flat Pinterest look
          }}
        >
          {/* Using icons for a modern Pinterest-like touch */}
          {isUser ? <PersonOutlineIcon fontSize="small" /> : <SmartToyOutlinedIcon fontSize="small" />}
        </Avatar>

        {/* Message Bubble (Paper) - Pinterest Visual Style */}
        <Paper
          sx={{
            // EXACTLY AS PROVIDED: p, px, maxWidth, minWidth, wordBreak, whiteSpace, lineHeight
            p: 1.8,
            px: 2.5,
            maxWidth: "100%",
            // minWidth: "80px", // THIS WAS THE DUPLICATE LINE THAT CAUSED THE ERROR
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
            // Pinterest-specific visual changes
            elevation: 0, // No elevation for a truly flat Pinterest look
            // Flat, subtle background colors
            backgroundColor: isUser
              ? "#e0e0e0" // Very light grey for user messages
              : "#ffffff", // Pure white for AI messages
            // Pinterest-style perfect pill-shaped border radius - using a large number for robustness
            borderRadius: 9999, // Guarantees a pill shape
            // Subtle box shadow to give a slight lift, common in Pinterest UI
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            border: "none", // No border for a truly clean look
          }}
        >
          <Typography
            variant="body1"
            sx={{
              // EXACTLY AS PROVIDED: fontSize
              fontSize: { xs: 15, sm: 16 },
              // Pinterest-specific visual changes
              color: "#333333", // Consistent dark grey text color for both
              fontWeight: 400, // Consistent standard font weight
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