// Backup of original MessageList component
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, useTheme, IconButton, Tooltip, TextField } from '@mui/material';
import { ChatBubbleOutline, SmartToy, Edit, Check, Close } from '@mui/icons-material';

function MessageList({ messages, loading, onEditMessage }) {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Auto-scroll to bottom on new messages/loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleEditClick = (messageIndex, messageText) => {
    setEditingIndex(messageIndex);
    setEditingText(messageText);
  };

  const handleSaveEdit = (messageIndex) => {
    if (onEditMessage && editingText.trim()) {
      onEditMessage(messageIndex, editingText.trim());
    }
    setEditingIndex(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleKeyDown = (e, messageIndex) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(messageIndex);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
          <MessageBubble
            key={index}
            message={message}
            index={index}
            theme={theme}
            editingIndex={editingIndex}
            editingText={editingText}
            setEditingText={setEditingText}
            handleEditClick={handleEditClick}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
            handleKeyDown={handleKeyDown}
          />
        ))
      )}

      {loading && <LoadingIndicator theme={theme} />}
      <div ref={messagesEndRef} />
    </Box>
  );
}

// Separate component for message bubble
function MessageBubble({ 
  message, 
  index, 
  theme, 
  editingIndex, 
  editingText, 
  setEditingText, 
  handleEditClick, 
  handleSaveEdit, 
  handleCancelEdit, 
  handleKeyDown 
}) {
  const getThemeColors = () => ({
    textPrimary: theme.palette.text.primary,
    userBubbleBg: theme.palette.mode === 'dark' ? '#2A2A2A' : '#E3F2FD',
    aiBubbleBg: theme.palette.mode === 'dark' ? '#1A1A1A' : theme.palette.background.paper,
  });

  const colors = getThemeColors();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '80%',
          position: 'relative',
          '&:hover .edit-button': {
            opacity: message.sender === 'user' ? 1 : 0,
          },
        }}
      >
        {message.sender !== 'user' && (
          <SmartToy
            sx={{
              color: theme.palette.primary.main,
              mt: 1.5,
              fontSize: '1.5rem',
            }}
          />
        )}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: message.sender === 'user' 
              ? colors.userBubbleBg 
              : colors.aiBubbleBg,
            color: colors.textPrimary,
            boxShadow: theme.shadows[1],
            position: 'relative',
            minWidth: editingIndex === index ? '300px' : 'auto',
          }}
        >
          {/* Conditional rendering: editing mode or display mode */}
          {editingIndex === index ? (
            // Editing mode
            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '8px 12px',
                    color: colors.textPrimary,
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                <Tooltip title="Save (Enter)">
                  <IconButton
                    size="small"
                    onClick={() => handleSaveEdit(index)}
                    sx={{
                      bgcolor: theme.palette.success.main,
                      color: 'white',
                      '&:hover': { bgcolor: theme.palette.success.dark },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <Check sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel (Esc)">
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    sx={{
                      bgcolor: theme.palette.error.main,
                      color: 'white',
                      '&:hover': { bgcolor: theme.palette.error.dark },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            // Display mode
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: 14, sm: 15 },
                color: colors.textPrimary,
                fontWeight: 400,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.text}
            </Typography>
          )}

          {/* Edit button for user messages */}
          {message.sender === 'user' && editingIndex !== index && (
            <Tooltip title="Edit message" arrow>
              <IconButton
                className="edit-button"
                size="small"
                onClick={() => handleEditClick(index, message.text)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                  },
                  width: 24,
                  height: 24,
                }}
              >
                <Edit sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Empty state component
function EmptyState({ theme }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: theme.palette.text.secondary,
      }}
    >
      <ChatBubbleOutline sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        No messages yet
      </Typography>
      <Typography variant="body2">
        Start a conversation by asking a question about your document
      </Typography>
    </Box>
  );
}

// Loading indicator component
function LoadingIndicator({ theme }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '80%',
        }}
      >
        <SmartToy
          sx={{
            color: theme.palette.primary.main,
            mt: 1.5,
            fontSize: '1.5rem',
          }}
        />
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: theme.palette.mode === 'dark' ? '#1A1A1A' : theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            AI is thinking...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default MessageList;
