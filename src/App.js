import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Button, CircularProgress, useMediaQuery, useTheme, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ContractManagement from './components/ContractManagement';
import ContractUpload from './components/ContractUpload';
import ContractReview from './components/ContractReview';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import AccountCircle from '@mui/icons-material/AccountCircle';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

function AppContent() {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  // Generate initials from username for avatar
  const getInitials = (name = 'User') => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  color: 'white',
                  '&:hover': { opacity: 0.9 },
                }}
              >
                Contract Assistant
              </Typography>
            </Link>
          </Box>

          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Avatar with Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  onClick={handleMenu}
                  sx={{
                    bgcolor: 'secondary.main',
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}
                  aria-label="User menu"
                >
                  {getInitials(user?.username || user?.email || 'User')}
                </Avatar>
                {!isMobile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: 'white',
                      }}
                    >
                      {user?.username || user?.email || 'User'}
                    </Typography>
                    <IconButton
                      onClick={handleMenu}
                      size="small"
                      sx={{ color: 'white', ml: 0.5 }}
                    >
                      <KeyboardArrowDown />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {user?.username || user?.email || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || `${user?.username}@citictel.com`}
                  </Typography>
                </Box>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button 
              component={Link} 
              to="/login" 
              color="inherit"
              sx={{ 
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: 4, 
          mb: 4,
          px: { xs: 2, md: 3 },
        }}
      >
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
