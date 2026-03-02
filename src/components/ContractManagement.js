import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Backdrop } from '@mui/material';
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
  TablePagination
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ReviewIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  GetApp as ExcelIcon
} from '@mui/icons-material';

// Status mapping
const statusMap = {
  'processing': { label: 'Processing', color: 'primary' },
  'completed': { label: 'Completed', color: 'success' },
  'error': { label: 'Error', color: 'error' }
};

const ContractManagement = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    code: ''
    // 移除了type字段
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

  useEffect(() => {
    // Initial data load
    fetchContracts();
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
      // 移除了type的查询条件
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
      
      if (data.contracts && Array.isArray(data.contracts)) {
        contracts = data.contracts;
        total = data.total || contracts.length;
      } else if (Array.isArray(data)) {
        contracts = data;
        if (contracts.length === 0 || (contracts.length === 1 && !Object.keys(contracts[0]).length)) {
          contracts = [];
          total = 0;
        } else {
          total = contracts.length;
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
          id: contract.id,
          code: contract.contract_no || contract.code || `CT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
          // type字段仍然保留在数据中，但不再显示在界面上
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
          arbitration_law: contract.arbitration_law || ''
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

  // 下载Excel文件
  const handleDownloadExcel = (id) => {
    console.log('Download Excel for contract with id:', id);
    window.open(`https://n8n.citictel.com/webhook/contract/excel?id=${id}`, '_blank');
  };

  const handleReview = (id) => {
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
        // type字段仍然保留在删除确认对话框中
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
e-Register/VOSS Number: ${contract?.code || 'Unknown'}
Current Status: ${statusText}
Creation Date: ${contract?.processDate || 'Unknown'}
Disclosing Party: ${contract?.disclosing_party || 'Unknown'}
Receiving Party: ${contract?.receiving_party || 'Unknown'}
Contract Summary: ${contract?.contract_summary || 'No summary available'}`);
    setCurrentContractId(id);
    setLogDialogOpen(true);
  };

  const handleCloseLogDialog = () => {
    setLogDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Load data for new page
    fetchContracts(newPage + 1, rowsPerPage, filters);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Load data with new page size
    fetchContracts(1, newRowsPerPage, filters);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              id="code-filter"
              name="code"
              label="e-Register/VOSS Number"
              value={filters.code}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {Object.entries(statusMap).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* 移除了Type查询字段 */}
          
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={handleSearch}>
                REFRESH
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<UploadIcon />}
                onClick={handleUpload}
              >
                Upload
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Contract List
        </Typography>
        <TableContainer component={Paper} sx={{ overflow: "visible" }}>
          <Table size="small" sx={{'& .MuiTableCell-root': {py: 0.5}}}>
            <TableHead>
              <TableRow>
                <TableCell>e-Register/VOSS Number</TableCell>
                {/* 移除了Type列 */}
                <TableCell>Status</TableCell>
                <TableCell>Process Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? contracts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : contracts
              ).map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.code}</TableCell>
                  {/* 移除了Type单元格 */}
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
                  <TableCell>{contract.processDate ? contract.processDate.split(' ')[0] : ''}</TableCell>

                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => handleDownloadExcel(contract.id)}
                      disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
                      title="Download Summary"
                    >
                      <ExcelIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(contract.id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleReview(contract.id)}
                      title="Review"
                      disabled={contract.status !== 'completed' && contract.status !== 'reviewed'}
                    >
                      <ReviewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        />
      </Box>

      {/* Process Log Dialog */}
      <Dialog
        open={logDialogOpen}
        onClose={handleCloseLogDialog}
        aria-labelledby="log-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="log-dialog-title">
          Contract Process Log (ID: {currentContractId})
        </DialogTitle>
        <DialogContent>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {processLog}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon color="error" />
          <span>Confirm Contract Deletion</span>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Are you sure you want to delete this contract? This action cannot be undone.
            </Typography>
            
            <Box sx={{ 
              backgroundColor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              mb: 2
            }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    e-Register/VOSS Number:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {deleteContractInfo.code}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Contract Type:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {deleteContractInfo.type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Status:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {deleteContractInfo.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Process Date:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {deleteContractInfo.processDate}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="body2" color="error" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.5,
              backgroundColor: 'error.light',
              borderRadius: 1,
              color: 'error.dark'
            }}>
              <WarningIcon fontSize="small" />
              <span>Warning: Contract data cannot be recovered after deletion. Please proceed with caution!</span>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleDeleteDialogClose}
            variant="outlined"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading data, please wait...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default ContractManagement;