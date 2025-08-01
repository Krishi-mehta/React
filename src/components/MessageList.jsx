import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, useTheme, IconButton, Tooltip } from '@mui/material';
import { ChatBubbleOutline, SmartToy, Edit } from '@mui/icons-material';

function MessageList({ messages, loading, onEditMessage }) {
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages/loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const greys = theme.palette.greys || {
    light: '#f5f5f5',
    medium: '#e0e0e0',
    dark: '#9e9e9e',
    darker: '#757575'
  };

  const handleEditClick = (messageIndex, messageText) => {
    if (onEditMessage) {
      onEditMessage(messageIndex, messageText);
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
          <Box
            key={index}
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
                    ? greys.light 
                    : theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  boxShadow: theme.shadows[1],
                  position: 'relative',
                }}
              >
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <Typography {...props} paragraph sx={{ margin: 0 }} />,
                    h1: ({node, ...props}) => <Typography {...props} variant="h1" sx={{ fontSize: '2em' }} />,
                    h2: ({node, ...props}) => <Typography {...props} variant="h2" sx={{ fontSize: '1.5em' }} />,
                    h3: ({node, ...props}) => <Typography {...props} variant="h3" sx={{ fontSize: '1.17em' }} />,
                    h4: ({node, ...props}) => <Typography {...props} variant="h4" sx={{ fontSize: '1em' }} />,
                    h5: ({node, ...props}) => <Typography {...props} variant="h5" sx={{ fontSize: '0.83em' }} />,
                    h6: ({node, ...props}) => <Typography {...props} variant="h6" sx={{ fontSize: '0.67em' }} />,
                    ul: ({node, ...props}) => <ul {...props} style={{ paddingLeft: '20px', margin: '8px 0' }} />,
                    ol: ({node, ...props}) => <ol {...props} style={{ paddingLeft: '20px', margin: '8px 0' }} />,
                    li: ({node, ...props}) => <li {...props} style={{ marginBottom: '4px' }} />,
                    code: ({node, inline, ...props}) => (
                      <Box 
                        component={inline ? 'span' : 'div'} 
                        sx={{ 
                          backgroundColor: greys.medium,
                          padding: inline ? '0.2em 0.4em' : '1em',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          display: inline ? 'inline' : 'block',
                          margin: inline ? 0 : '8px 0'
                        }}
                        {...props}
                      />
                    ),
                    a: ({node, ...props}) => (
                      <a 
                        {...props} 
                        style={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                        }} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                      />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote 
                        {...props} 
                        style={{
                          borderLeft: `4px solid ${greys.medium}`,
                          margin: '8px 0',
                          paddingLeft: '16px',
                          color: theme.palette.text.secondary
                        }} 
                      />
                    ),
                    table: ({node, ...props}) => (
                      <table 
                        {...props} 
                        style={{
                          borderCollapse: 'collapse',
                          width: '100%',
                          margin: '16px 0'
                        }} 
                      />
                    ),
                    th: ({node, ...props}) => (
                      <th 
                        {...props} 
                        style={{
                          border: `1px solid ${theme.palette.divider}`,
                          padding: '8px',
                          textAlign: 'left',
                          backgroundColor: greys.light
                        }} 
                      />
                    ),
                    td: ({node, ...props}) => (
                      <td 
                        {...props} 
                        style={{
                          border: `1px solid ${theme.palette.divider}`,
                          padding: '8px'
                        }} 
                      />
                    ),
                  }}
                >
                  {message.text}
                </ReactMarkdown>

                {/* Edit button for user messages */}
                {message.sender === 'user' && (
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
        ))
      )}

      {loading && (
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
                p: 2,
                borderRadius: '12px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: theme.shadows[1],
              }}
            >
              <Box sx={{ 
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                height: '16px'
              }}>
                {[...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: theme.palette.grey[500],
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: `${i * 0.16}s`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': { 
                          transform: 'translateY(0)' 
                        },
                        '40%': { 
                          transform: 'translateY(-6px)' 
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
}

function EmptyState({ theme }) {
  // Define colors with theme fallbacks
  const iconBg = theme.palette.grey?.[100] || theme.palette.greys?.light || "#F3F4F6";
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
        <SmartToy
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