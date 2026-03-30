import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, CircularProgress, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from './PageTransition';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [showPage, setShowPage] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle page visibility animation
  useEffect(() => {
    setShowPage(true);
  }, []);

  // Redirect if already authenticated
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/contracts" replace />;
  }

  // Show loading animation during navigation
  if (isNavigating) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            opacity: 0,
            animation: 'fadeIn 0.5s ease forwards',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'scale(0.9)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Signing you in...
          </Typography>
        </Box>
      </Box>
    );
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ username: true, password: true });
    setError('');

    // Validate username is provided
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        username: username.trim(),
        password,
      };
        
      const response = await fetch('https://n8n.citictel.com/webhook/contract-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.result === true) {
          const userData = {
            username: result.username || username,
            email: `${username}@citictel.com`,
          };
          login(userData);
          setIsNavigating(true);
          setTimeout(() => {
            navigate('/contracts');
          }, 500);
        } else {
          setError(result.msg);
        }
      } else {
        setError('Username or password does not match');
      }
    } catch (err) {
      console.error('Login service error:', err.message);
      setError('Username or password does not match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh - 64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 8,
      }}
    >
      <Container component="main" maxWidth="sm">
        <PageTransition show={showPage}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              component="h1"
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                mb: 1,
                fontWeight: 700,
                color: 'primary.main',
                textAlign: 'center',
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 3 }}
            >
              Sign in to continue to Contract Assistant
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => handleBlur('username')}
              error={touched.username && !username.trim()}
              helperText={touched.username && !username.trim() ? 'Username is required' : ''}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && !password}
              helperText={touched.password && !password ? 'Password is required' : ''}
              disabled={loading}
              sx={{ mb: 4 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Paper>
        </PageTransition>
      </Container>
    </Box>
  );
}

export default Login;
