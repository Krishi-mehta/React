import React, { useRef, useEffect } from "react"; // Added useEffect for potential future scroll
import { Box, Typography } from "@mui/material";
import { Forum } from "@mui/icons-material";
import Message from "./Message";
import LoadingMessage from "./LoadingMessage";

function MessageList({ messages, loading }) {
  const messagesEndRef = useRef(null);

  // Optional: Auto-scroll to bottom on new messages/loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        px: { xs: 1, sm: 2, md: 5 }, // Keeping your original padding
        py: 1, // Keeping your original padding
        display: "flex",
        flexDirection: "column",
        gap: 1.5, // Keeping your original gap
        minHeight: 0,
        maxHeight: "100%",
        // Pinterest-like background for the chat area itself
        bgcolor: '#ffffff', // Clean white background for the chat area
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
        alignItems: "center", // Keeping your original alignment
        justifyContent: "center", // Keeping your original alignment
        textAlign: "center", // Keeping your original alignment
        color: "#a0a0a0", // Soft grey for text.secondary equivalent, Pinterest often uses softer tones
        px: 2, // Keeping your original padding
        py: 4, // Keeping your original padding
        // No specific background here, will inherit from parent MessageList's bgcolor
      }}
    >
      <Forum
        sx={{
          fontSize: { xs: 36, sm: 40 },
          mb: 1,
          color: '#e60023', // Pinterest red for the icon
          // Optional: Subtle shadow for the icon for a lifted feel, if desired
          // textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
      <Typography
        variant="h6"
        fontSize={{ xs: "1rem", sm: "1.25rem" }} // Keeping your original font sizes
        sx={{
          fontWeight: 600, // Slightly bolder for titles like Pinterest
          color: '#333333', // Darker text for main titles
          mt: 1, // Add a little margin top to separate from icon if needed
        }}
      >
        Start a conversation
      </Typography>
      <Typography
        fontSize={{ xs: "0.85rem", sm: "1rem" }} // Keeping your original font sizes
        sx={{
          color: '#767676', // Muted grey for descriptive text
          maxWidth: '300px', // Helps keep the text centered and readable
          mx: 'auto', // Center the text block itself
        }}
      >
        Upload PDFs and ask questions about their content
      </Typography>
    </Box>
  );
}

export default MessageList;