import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";

function LoadingMessage() {
  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 6, lg: 25 }, // responsive horizontal padding
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 2 }, // responsive gap
        alignSelf: "flex-start",
        width: "100%", // take full width on mobile
      }}
    >
      <Avatar
        sx={{
          width: { xs: 28, sm: 32 },
          height: { xs: 28, sm: 32 },
          bgcolor: "#e0e0e0",
          fontSize: { xs: "0.8rem", sm: "1rem" },
        }}
      >
        AI
      </Avatar>

      <Paper
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: { xs: "85%", sm: "80%", md: "60%" }, // responsive width
          fontSize: { xs: "0.8rem", sm: "1rem" },
          borderRadius: "18px 18px 18px 0",
          border: "1px solid #e0e0e0",
          wordBreak: "break-word", // wrap long text
        }}
      >
        <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
          ...
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoadingMessage;
