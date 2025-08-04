// src/components/Login.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/chat/new');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
            width: '100%',
            maxWidth: 400
          }}
        >
          {/* App Logo/Title */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#6366F1',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <Typography 
                sx={{ 
                  color: 'white', 
                  fontSize: '24px', 
                  fontWeight: 'bold' 
                }}
              >
                FM
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#111827',
                mb: 1
              }}
            >
              FileMentor
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#6B7280',
                lineHeight: 1.5
              }}
            >
              Chat with your documents using AI
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              py: 1.5,
              px: 3,
              borderColor: '#E5E7EB',
              color: '#374151',
              fontSize: '16px',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#D1D5DB',
                bgcolor: '#F9FAFB'
              },
              '&:disabled': {
                opacity: 0.6
              }
            }}
            startIcon={
              loading ? (
                <CircularProgress size={20} />
              ) : (
                <GoogleIcon sx={{ color: '#4285F4' }} />
              )
            }
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Terms */}
          <Typography
            variant="caption"
            sx={{
              color: '#9CA3AF',
              mt: 3,
              display: 'block',
              lineHeight: 1.4
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;