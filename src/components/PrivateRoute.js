import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box, Typography, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          gap: 3
        }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: 'primary.main' }}
          aria-label="Loading"
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Loading...
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
        >
          Please wait while we verify your session
        </Typography>
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
