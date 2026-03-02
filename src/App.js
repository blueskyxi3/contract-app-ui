import React, { useState } from 'react';
import { BrowserRouter,Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import ContractManagement from './components/ContractManagement';
import ContractUpload from './components/ContractUpload';
import ContractReview from './components/ContractReview';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Contract Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

        <Routes>
          <Route path="/" element={<ContractManagement />} />
          <Route path="/contracts" element={<ContractManagement />} />
          <Route path="/upload" element={<ContractUpload />} />
          <Route path="/review/:id" element={<ContractReview />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
