import React from "react";
import { Box } from "@mui/material";
import Message from "./Message";
// import LoadingMessage from "./LoadingMessage";
import LoadingMessage from "./LoadingMessage";
import { useRef } from "react";
import { Typography } from "@mui/material";
import { Forum } from "@mui/icons-material";

function MessageList({ messages, loading }) {
  const messagesEndRef = useRef(null);
  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        p: { xs: 1.5, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: 0, // Important for scroll inside flexbox
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <Forum sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6">Start a conversation</Typography>
      <Typography>Upload PDFs and ask questions about their content</Typography>
    </Box>
  );
}

export default MessageList;
