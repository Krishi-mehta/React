import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";

const Message = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        px: { xs: 1, sm: 2, md: 10, lg: 25 },
        mb: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          maxWidth: "80%",
          gap: 1,
          flexDirection: isUser ? "row-reverse" : "row",
        }}
      >
        {!isUser && (
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>AI</Avatar>
        )}

        <Paper
          elevation={2}
          sx={{
            p: 1.5,
            bgcolor: isUser ? "#DCF8C6" : "#f0f0f0",
            borderRadius: isUser
              ? "16px 16px 0 16px"
              : "16px 16px 16px 0",
            maxWidth: "fit-content",
            minWidth: "50px",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 } }}>
            {message.text}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Message;
