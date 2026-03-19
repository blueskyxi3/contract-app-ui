import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { AuthProvider } from './contexts/AuthContext';

// Code splitting with lazy loading
const App = lazy(() => import('./App'));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a2540', // Deep navy for professional look
      light: '#1e4976',
      dark: '#061424',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0066cc', // Bright blue for actions
      light: '#3385db',
      dark: '#004a91',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef6c6c',
      dark: '#9a0007',
    },
    warning: {
      main: '#ed6c02',
      light: '#f39c12',
      dark: '#b76e00',
    },
    success: {
      main: '#2e7d32',
      light: '#66bb6a',
      dark: '#1b5e20',
    },
    info: {
      main: '#0288d1',
      light: '#4fc3f7',
      dark: '#01579b',
    },
    background: {
      default: '#f8fafc', // Light gray-blue background with depth
      paper: '#ffffff',
    },
    text: {
      primary: '#0a2540', // Deep navy for primary text
      secondary: '#64748b', // Slate for secondary text
      disabled: '#94a3b8',
      hint: '#cbd5e1',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem', // 32px - 1.25x jump
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem', // 24px - 1.33x jump
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem', // 16px minimum
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 12px 36px rgba(0,0,0,0.14)',
    '0 16px 48px rgba(0,0,0,0.16)',
    '0 20px 60px rgba(0,0,0,0.18)',
    '0 24px 72px rgba(0,0,0,0.20)',
    '0 28px 84px rgba(0,0,0,0.22)',
    '0 32px 96px rgba(0,0,0,0.24)',
    '0 36px 108px rgba(0,0,0,0.26)',
    '0 40px 120px rgba(0,0,0,0.28)',
    '0 44px 132px rgba(0,0,0,0.30)',
    '0 48px 144px rgba(0,0,0,0.32)',
    '0 52px 156px rgba(0,0,0,0.34)',
    '0 56px 168px rgba(0,0,0,0.36)',
    '0 60px 180px rgba(0,0,0,0.38)',
    '0 64px 192px rgba(0,0,0,0.40)',
    '0 68px 204px rgba(0,0,0,0.42)',
    '0 72px 216px rgba(0,0,0,0.44)',
    '0 76px 228px rgba(0,0,0,0.46)',
    '0 80px 240px rgba(0,0,0,0.48)',
    '0 84px 252px rgba(0,0,0,0.50)',
    '0 88px 264px rgba(0,0,0,0.52)',
    '0 92px 276px rgba(0,0,0,0.54)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: 2,
    }}
  >
    <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
  </Box>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename='/contract-app'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <App />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
