import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Forum } from "@mui/icons-material";
import Message from "./Message";
import LoadingMessage from "./LoadingMessage";

function MessageList({ messages, loading }) {
  const messagesEndRef = useRef(null);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        px: { xs: 1, sm: 2, md: 5 },
        py: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        minHeight: 0,
        maxHeight: "100%",
      }}
    >
      {messages.length === 0 ? (
        <EmptyState />
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

function EmptyState() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "text.secondary",
        px: 2,
        py: 4,
      }}
    >
      <Forum sx={{ fontSize: { xs: 36, sm: 40 }, mb: 1 }} />
      <Typography variant="h6" fontSize={{ xs: "1rem", sm: "1.25rem" }}>
        Start a conversation
      </Typography>
      <Typography fontSize={{ xs: "0.85rem", sm: "1rem" }}>
        Upload PDFs and ask questions about their content
      </Typography>
    </Box>
  );
}

export default MessageList;
