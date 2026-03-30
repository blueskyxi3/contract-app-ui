import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Backdrop, useTheme, useMediaQuery } from '@mui/material';
import PageTransition from './PageTransition';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Stack,
  Chip as MuiChip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ReviewIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  GetApp as ExcelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Status mapping
const statusMap = {
  'processing': { label: 'Processing', color: 'primary' },
  'completed': { label: 'Completed', color: 'success' },
  'error': { label: 'Error', color: 'error' }
};

const ContractManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    code: ''
  });
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [processLog, setProcessLog] = useState('');
  const [currentContractId, setCurrentContractId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [deleteContractInfo, setDeleteContractInfo] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPage, setShowPage] = useState(false);
  
  useEffect(() => {
    // Initial data load
    fetchContracts();
    setShowPage(true);
  }, []);
  
  // Fetch contract data
  const fetchContracts = async (currentPage = page + 1, currentRowsPerPage = rowsPerPage, currentFilters = filters) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination parameters
      params.append('page', currentPage);
      params.append('number', currentRowsPerPage);
      
      // Add filter conditions
      if (currentFilters.status) {
        params.append('contract_status', currentFilters.status);
      }
      if (currentFilters.code) {
        params.append('contract_no', currentFilters.code);
      }
      
      // Send request
      const response = await fetch(`https://n8n.citictel.com/webhook/contract?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Query failed: ${response.status} ${response.statusText}`);
      }
      
      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Server returned non-JSON format response');
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        const textResponse = await response.clone().text();
        console.error('Raw response:', textResponse);
        throw new Error('Response data is not valid JSON format');
      }
      
      console.log('Contract data fetched successfully:', data);
      
      // Try different data formats
      let contracts = [];
      let total = 0;
      
      if (data.rows && Array.isArray(data.rows)) {
        contracts = data.rows;
        total = data.total || contracts.length;
      } else if (data.contracts && Array.isArray(data.contracts)) {
        contracts = data.contracts;
        total = data.total || contracts.length;
      } else if (Array.isArray(data)) {
        contracts = data;
        if (contracts.length === 0 || (contracts.length === 1 && !Object.keys(contracts[0]).length)) {
          contracts = [];
          total = 0;
        } else {
          total = data.total;
        }
      } else if (data.data && Array.isArray(data.data)) {
        contracts = data.data;
        total = data.total || contracts.length;
      } else {
        console.warn('Unknown data format:', data);
      }
      
      // Ensure each contract object has necessary properties and adapt to real data structure
      if (contracts.length > 0) {
        contracts = contracts.map(contract => ({
          ...contract,
          // Ensure status field exists and is valid, mapped to lowercase
          status: (contract.contract_status || contract.status || 'initialized').toLowerCase(),
          // Ensure there's always a valid ID - use contract_no or generate one if needed
          id: contract.id || contract.contract_no || contract.code || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          code: contract.contract_no || contract.code || `CT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
          type: contract.contract_type || contract.type || 'Confidentiality Agreement',
          processDate: contract.processDate || contract.created_at || new Date().toISOString().split('T')[0],
          // Add other real data fields
          link: contract.link || '',
          disclosing_party: contract.disclosing_party || '',
          receiving_party: contract.receiving_party || '',
          party_country: contract.party_country || '',
          party_type: contract.party_type || '',
          contract_summary: contract.contract_summary || '',
          confidentiality_period: contract.confidentiality_period || '',
          arbitration_law: contract.arbitration_law || '',
          auditor: contract.auditor || ''
        }));
      } else {
        // If contracts is empty array, keep it empty
        contracts = [];
      }
      
      setContracts(contracts);
      setTotalCount(total);
    } catch (error) {
      console.error('Error fetching contract data:', error);
      alert(`Failed to fetch contract data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // Reset page to first page
    setPage(0);
    // Call API for search
    fetchContracts(1, rowsPerPage, filters);
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  // Download Excel file
  const handleDownloadExcel = (id) => {
    console.log('Download Excel for contract with id:', id);
    window.open(`https://n8n.citictel.com/webhook/contract/excel?id=${id}`, '_blank');
  };
  const handleDownloadNonOAExcel = (id) => {
    console.log('Download Excel for contract with id:', id);
    window.open(`https://n8n.citictel.com/webhook/contract/excel-nonoa?id=${id}`, '_blank');
  };
  const handleReview = (id) => {
    console.log('handleReview called with id:', id);
    console.log('Type of id:', typeof id);
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid contract ID:', id);
      alert('Invalid contract ID. Please refresh the page and try again.');
      return;
    }
    
    // Pass contract ID in URL, review page can get contract details based on ID
    navigate(`/review/${id}`);
  };

  

  // Open delete confirmation dialog
  const handleDeleteClick = (id) => {
    const contract = contracts.find(c => c.id === id);
    if (contract) {
      setContractToDelete(id);
      setDeleteContractInfo({
        code: contract.code,
        type: contract.type,
        status: statusMap[contract.status]?.label || contract.status,
        processDate: contract.processDate ? contract.processDate.split(' ')[0] : ''
      });
      setDeleteDialogOpen(true);
    }
  };

  // Close delete confirmation dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
    setDeleteContractInfo({});
    setIsDeleting(false);
  };

  // Execute delete operation
  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`https://n8n.citictel.com/webhook/contract?id=${contractToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      // Update local state after successful deletion
      setContracts(contracts.filter(contract => contract.id !== contractToDelete));
      setTotalCount(prev => prev - 1);
      
      // Close dialog
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert(`Failed to delete contract: ${error.message}`);
      setIsDeleting(false);
    }
  };

  const handleStatusHover = (id) => {
    const contract = contracts.find(c => c.id === id);
    let statusText = 'Unknown Status';
    
    switch (contract?.status) {
      case 'initialized':
        statusText = 'Contract created, waiting for processing';
        break;
      case 'processing':
        statusText = 'Contract is being processed';
        break;
      case 'completed':
        statusText = 'Contract review completed';
        break;
      case 'error':
        statusText = 'Error occurred during contract processing';
        break;
      default:
        statusText = 'Contract status unknown';
    }
    
    setProcessLog(`Contract Process Log - ID: ${id}
     Contract Number: ${contract?.code || 'Unknown'}
     Current Status: ${statusText}
     Creation Date: ${contract?.processDate || 'Unknown'}
     Disclosing Party: ${contract?.disclosing_party || 'Unknown'}
     Receiving Party: ${contract?.receiving_party || 'Unknown'}
     Contract Summary: ${contract?.contract_summary || 'No summary available'}
     ${contract?.status === 'error' ? `Remarks: ${contract?.remarks || 'No remarks available'}` : ''}`);
    setCurrentContractId(id);
    setLogDialogOpen(true);
  };

  const handleCloseLogDialog = () => {
    setLogDialogOpen(false);
  };

  const handleChangePage = (direction) => {
    // Load data for new page first, then update state
    const newPage = direction === 'next' ? page + 1 : page - 1;
    fetchContracts(newPage + 1, rowsPerPage, filters);
    setPage(newPage);
  };

  // Mobile card view
  const renderMobileCard = (contract) => (
    <Card 
      key={contract.id} 
      sx={{ 
        mb: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {contract.code}
          </Typography>
          <Tooltip title="Tap to view process log" arrow>
            <Chip
              label={statusMap[contract.status]?.label || contract.status}
              color={statusMap[contract.status]?.color || 'default'}
              size="small"
              icon={<InfoIcon />}
              onClick={() => handleStatusHover(contract.id)}
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {contract.processDate ? contract.processDate.split(' ')[0] : ''}
        </Typography>
        
        {contract.auditor && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Auditor: {contract.auditor}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>       
          <Tooltip title="Download Summary">
            <IconButton
              color="success"
              onClick={() => handleDownloadExcel(contract.id)}
              disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
              size="small"
              sx={{ padding: 0.5 }}
            >
              <ExcelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => handleDeleteClick(contract.id)}
              size="small"
              sx={{ padding: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Review">
            <IconButton
              color="primary"
              onClick={() => handleReview(contract.id)}
              disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
              size="small"
              sx={{ padding: 0.5 }}
            >
              <ReviewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
  
  return (
    <PageTransition show={showPage}>
      <Box sx={{
        pb: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.5rem' }}>
              Contracts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and review your contracts
            </Typography>
          </Box>
          {!isMobile && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadIcon />}
              onClick={handleUpload}
              size="small"
              sx={{ 
                fontWeight: 600,
                minWidth: 120,
                py: 0.75,
                fontSize: '0.8125rem'
              }}
            >
              Upload New
            </Button>
          )}
        </Box>
      
      {/* Filters */}
      <Card sx={{
        mb: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        flexShrink: 0
      }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="code-filter"
                name="code"
                label="Contract Number"
                value={filters.code}
                onChange={handleFilterChange}
                size="small"
                placeholder="Search by number..."
                sx={{ fontSize: '0.8125rem' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                {isMobile && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<UploadIcon />}
                    onClick={handleUpload}
                    sx={{ 
                      fontWeight: 600,
                      minWidth: { xs: 'auto', md: 140 }
                    }}
                  >
                    Upload
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={handleSearch}
                  startIcon={<RefreshIcon />}
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    flex: 1,
                    fontSize: '0.8125rem',
                    py: 0.5
                  }}
                >
                  Refresh
                </Button>
              </Stack>
            </Grid>
          </Grid>
          </CardContent>
        </Card>
      </Box>
      
      {/* Table/Card View */}
      <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden', flex: 1, minHeight: 0 }}>
        <CardContent sx={{ p: 0 }}>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              {contracts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <InfoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No contracts found
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    Upload your first contract to get started
                  </Typography>
                </Box>
              ) : (
                contracts.map(renderMobileCard)
              )}
            </Box>
          ) : (
            <TableContainer sx={{ overflow: 'auto' }}>
              <Table sx={{
                minWidth: 600,
                tableLayout: 'fixed',
                '& .MuiTableCell-root': {
                  py: 0.75,
                  px: 1.25,
                },
                '& .MuiTableCell-head': {
                  py: 0.75,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                },
                '& .MuiTableCell-body': {
                  fontSize: '0.8125rem',
                }
              }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 600, width: '30%', fontSize: '0.8125rem' }}>Contract Number</TableCell>        
                    <TableCell sx={{ fontWeight: 600, width: '15%', fontSize: '0.8125rem' }}>Operator</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '20%', fontSize: '0.8125rem' }}>Process Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '15%', fontSize: '0.8125rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '20%', fontSize: '0.8125rem' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box>
                          <InfoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No contracts found
                          </Typography>
                          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                            Upload your first contract to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => (
                      <TableRow 
                        key={contract.id} 
                        hover
                        sx={{ 
                          transition: 'background-color 0.2s',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{contract.code}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{contract.auditor || '-'}</TableCell>
                        <TableCell>{contract.processDate ? contract.processDate.split(' ')[0] : ''}</TableCell>
                        <TableCell>
                          <Tooltip title="Click to view process log" arrow>
                            <Chip
                              label={statusMap[contract.status]?.label || contract.status}
                              color={statusMap[contract.status]?.color || 'default'}
                              size="small"
                              icon={<InfoIcon />}
                              onClick={() => handleStatusHover(contract.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Download Non-OA Summary">
                            <IconButton
                              color="success"
                              onClick={() => handleDownloadNonOAExcel(contract.id)}
                              disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
                              size="small"
                            >
                              <ExcelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download OA Summary">
                            <IconButton
                              color="success"
                              onClick={() => handleDownloadExcel(contract.id)}
                              disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
                              size="small"
                            >
                              <ExcelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(contract.id)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Review">
                            <IconButton
                              color="primary"
                              onClick={() => handleReview(contract.id)}
                              disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
                              size="small"
                            >
                              <ReviewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {contracts.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              pt: 2,
              gap: 2,
              flexShrink: 0,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {Math.min(page * rowsPerPage + 1, totalCount)} - {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleChangePage('previous')}
                  disabled={page === 0}
                  sx={{ minWidth: 80, py: 1, px: 2, fontSize: '0.8125rem' }}
                >
                  Previous
                </Button>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  px: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  minWidth: 70,
                  justifyContent: 'center',
                  height: 32
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {page + 1}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleChangePage('next')}
                  disabled={(page + 1) * rowsPerPage >= totalCount || totalCount === 0}
                  sx={{ minWidth: 80, py: 1, px: 2, fontSize: '0.8125rem' }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Process Log Dialog */}
      <Dialog
        open={logDialogOpen}
        onClose={handleCloseLogDialog}
        aria-labelledby="log-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle id="log-dialog-title">
          Contract Process Log
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            bgcolor: 'grey.50', 
            p: 2, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography component="pre" sx={{ 
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}>
              {processLog}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseLogDialog}
            variant="contained"
            sx={{ 
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 120,
              fontSize: '0.8125rem'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle 
          id="delete-dialog-title" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            color: 'error.main',
            pb: 1
          }}
        >
          <WarningIcon color="error" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              This action cannot be undone
            </Alert>
            
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mb: 2
            }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Contract Number:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {deleteContractInfo.code}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Contract Type:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {deleteContractInfo.type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Current Status:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {deleteContractInfo.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Process Date:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {deleteContractInfo.processDate}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="body2" color="error.dark" sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 1,
              p: 2,
              bgcolor: 'error.light',
              borderRadius: 2,
              fontWeight: 500,
              fontSize: '0.8125rem'
            }}>
              <WarningIcon fontSize="small" sx={{ mt: 0.3 }} />
              <span>Contract data cannot be recovered after deletion. Please proceed with caution!</span>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleDeleteDialogClose}
            variant="outlined"
            disabled={isDeleting}
            sx={{ 
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 100,
              fontSize: '0.8125rem'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{ 
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 140,
              fontSize: '0.8125rem'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Loading overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <CircularProgress color="inherit" size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 600, fontSize: '0.8125rem' }}>
            Loading contracts...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Please wait while we fetch your data
          </Typography>
        </Box>
      </Backdrop>
    </Box>
    </PageTransition>
  );
};

export default ContractManagement;
