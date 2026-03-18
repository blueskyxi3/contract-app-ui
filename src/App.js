import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Button, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ContractManagement from './components/ContractManagement';
import ContractUpload from './components/ContractUpload';
import ContractReview from './components/ContractReview';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const { isAuthenticated, logout, user, isLoading } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Contract Assistant
          </Typography>
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user?.username || user?.email || 'User'}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button component={Link} to="/login" color="inherit">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Navigate to="/contracts" replace />} />
            <Route path="contracts" element={<ContractManagement />} />
            <Route path="upload" element={<ContractUpload />} />
            <Route path="review/:id" element={<ContractReview />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
