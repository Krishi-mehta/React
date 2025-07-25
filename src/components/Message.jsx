import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";

function Message({ message }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: message.sender === "user" ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.5,
          flexDirection: message.sender === "user" ? "row-reverse" : "row",
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "#e0e0e0",
            color: "text.primary",
          }}
        >
          {message.sender === "user" ? "U" : "AI"}
        </Avatar>
        <Typography variant="caption" color="text.secondary">
          {message.timestamp}
        </Typography>
      </Box>
      <Paper
        sx={{
          p: 2,
          maxWidth: "70%",
          bgcolor: "white",
          border: "1px solid #e0e0e0",
          color: "text.primary",
          borderRadius:
            message.sender === "user"
              ? "18px 18px 0 18px"
              : "18px 18px 18px 0",
        }}
      >
        <Typography whiteSpace="pre-wrap">{message.text}</Typography>
      </Paper>
    </Box>
  );
}

export default Message;