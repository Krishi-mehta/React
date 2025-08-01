import React, { useState, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Send, Pause, Edit } from '@mui/icons-material';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: input,
      isUser: true
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    setIsProcessing(true);
    
    abortControllerRef.current = new AbortController();
    
    try {
      // Simulate AI response
      const response = await fetchAIResponse(input, abortControllerRef.current.signal);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response,
        isUser: false
      }]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error:', err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchAIResponse = (query, signal) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(`AI response to: "${query}"`);
      }, 2000);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  };

  const handlePause = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Messages display */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: message.isUser ? 'primary.light' : 'background.paper',
                maxWidth: '80%'
              }}
            >
              <Typography>{message.text}</Typography>
            </Box>
          </Box>
        ))}
        
        {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: 'background.paper',
                maxWidth: '80%',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box sx={{ 
                display: 'flex',
                gap: '4px',
                mr: 2
              }}>
                {[...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      bgcolor: 'text.primary',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: `${i * 0.16}s`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': { transform: 'translateY(0)' },
                        '40%': { transform: 'translateY(-6px)' }
                      }
                    }}
                  />
                ))}
              </Box>
              <IconButton onClick={handlePause}>
                <Pause fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Input area */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginRight: '8px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;