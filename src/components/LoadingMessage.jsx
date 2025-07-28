import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import { keyframes } from "@emotion/react";
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'; // Importing a modern AI icon

// Typing dots bounce animation - refined for smoother, subtle bounce
const bounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  25% { transform: translateY(-3px); opacity: 1; }
  50% { transform: translateY(0); opacity: 0.7; }
  75% { transform: translateY(-1px); opacity: 0.9; }
`;

function LoadingMessage() {
  return (
    <Box
      sx={{
        // THIS IS THE KEY CHANGE: Aligning horizontal padding with your Message component
        px: { xs: 1, sm: 2, md: 10, lg: 25 },
        mb: 1.5, // Consistent margin bottom for spacing between messages
        display: "flex",
        // Align avatar and message bubble to their top edge
        alignItems: "flex-start",
        gap: { xs: 1.5, sm: 2 }, // Spacing between avatar and bubble
        alignSelf: "flex-start", // This correctly positions the message on the left (for AI)
        width: "100%",
        boxSizing: 'border-box', // Ensure padding is included in the width calculation
      }}
    >
      {/* AI Avatar - Pinterest Style */}
      <Avatar
        sx={{
          width: { xs: 32, sm: 36 }, // Slightly larger avatar for better visual presence
          height: { xs: 32, sm: 36 },
          bgcolor: "#e60023", // Iconic Pinterest red for the AI avatar
          color: "#ffffff", // White icon/text for contrast
          fontSize: { xs: "0.9rem", sm: "1.1rem" },
          fontWeight: 600,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)", // Subtle shadow for depth
          flexShrink: 0, // Prevent avatar from shrinking when space is tight
        }}
      >
        {/* Using a modern AI icon instead of "AI" text */}
        <SmartToyOutlinedIcon fontSize="small" />
      </Avatar>

      {/* Loading Message Bubble (Paper) - Pinterest Style */}
      <Paper
        elevation={0} // Remove default Material-UI shadow for a flatter, cleaner look
        sx={{
          // Adjusted padding inside the bubble for a balanced, compact feel
          p: { xs: 1, sm: 1.5 },
          // Responsive max-width to keep bubbles from stretching too wide on large screens
          maxWidth: { xs: "85%", sm: "80%", md: "65%", lg: "50%" },
          fontSize: { xs: "0.9rem", sm: "1rem" }, // Consistent font size
          // Pinterest-like rounded corners with a subtle 'tail' on the bottom-left
          borderRadius: "18px 18px 18px 6px",
          border: "1px solid #e0e0e0", // Light, clean border
          backgroundColor: "#f5f5f5", // Very light grey background (common for AI/system messages)
          wordBreak: "break-word",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)", // Subtle shadow for a gentle lift
          // Ensure the bubble itself is a flex container to perfectly center dots
          display: 'flex',
          alignItems: 'center', // Vertically center the typing dots
          justifyContent: 'flex-start', // Align dots to the start
          minHeight: '40px', // Ensure a minimum height for the bubble
        }}
      >
        <Typography
          component="div"
          sx={{
            display: "flex",
            gap: "5px", // Spacing between dots
            alignItems: "center", // Vertically center dots within their container
            justifyContent: "flex-start",
            minHeight: '18px', // Ensure dots have enough vertical space for animation
          }}
        >
          {[0, 1, 2].map((dot, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: "5px", sm: "6px" }, // Responsive dot size
                height: { xs: "5px", sm: "6px" },
                borderRadius: "50%", // Round dots
                backgroundColor: "#888", // Darker grey for better visibility
                animation: `${bounce} 1.4s infinite`, // Smooth, slightly longer animation
                animationDelay: `${index * 0.15}s`, // Staggered animation start
                opacity: 0.5, // Start with subtle opacity
              }}
            />
          ))}
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoadingMessage;