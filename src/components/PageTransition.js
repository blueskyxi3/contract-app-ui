import React from 'react';
import { Box } from '@mui/material';

function PageTransition({ children, show }) {
  return (
    <Box
      sx={{
        opacity: show ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transitionProperty: 'opacity, transform',
        transitionDuration: show ? '0.4s, 0.4s' : '0.2s, 0.2s',
        transitionDelay: show ? '0.1s, 0s' : '0s, 0s',
      }}
    >
      {children}
    </Box>
  );
}

export default PageTransition;
