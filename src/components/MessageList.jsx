import React, { useRef, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";
import Message from "./Message";
import LoadingMessage from "./LoadingMessage";

function MessageList({ messages, loading }) {
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages/loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        px: { xs: 1, sm: 2, md: 3, lg: 20 },
        py: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: 0,
        maxHeight: "100%",
        bgcolor: theme.palette.background.default,
      }}
    >
      {messages.length === 0 ? (
        <EmptyState theme={theme} />
      ) : (
        messages.map((message, index) => (
          <Message key={index} message={message} />
        ))
      )}

      {loading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </Box>
  );
}

function EmptyState({ theme }) {
  // Define colors with theme fallbacks
  const iconBg = theme.palette.grey[100] || "#F3F4F6";
  const iconColor = theme.palette.text.secondary || "#6B7280";
  const headingColor = theme.palette.text.primary || "#343541";
  const textColor = theme.palette.text.secondary || "#6B7280";

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: 8,
      }}
    >
      <Box
        sx={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <ChatBubbleOutline
          sx={{
            fontSize: 35,
            color: iconColor,
          }}
        />
      </Box>

      <Typography
        variant="h5"
        sx={{
          color: headingColor,
          fontWeight: 600,
          mb: 1.5,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        How can I help you today?
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: textColor,
          maxWidth: '450px',
          lineHeight: 1.5,
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        I can help you analyze and answer questions about your uploaded documents. Ask me anything!
      </Typography>
    </Box>
  );
}

export default MessageList;