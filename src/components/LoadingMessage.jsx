import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";

function LoadingMessage() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        alignSelf: "flex-start",
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
        AI
      </Avatar>
      <Paper
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: "80%",
          fontSize: { xs: "0.8rem", sm: "1rem" },
          borderRadius: "18px 18px 18px 0",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography>...</Typography>
      </Paper>
    </Box>
  );
}

export default LoadingMessage;
