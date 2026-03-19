import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  IconButton,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const ContractUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    file: null,
    template: 'Confidentiality Agreement',
    contractNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState({
    show: false,
    message: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [touched, setTouched] = useState({
    file: false,
    contractNumber: false
  });
  const [isCheckingContract, setIsCheckingContract] = useState(false);
  const [contractCheckResult, setContractCheckResult] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const processFile = (file) => {
    if (file && ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      .includes(file.type)) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        file: 'Only .pdf, .doc, .docx files are allowed'
      }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleCheckContract = async () => {
    if (!formData.contractNumber.trim()) {
      setErrors(prev => ({ ...prev, contractNumber: 'Please enter a contract number' }));
      setContractCheckResult(null);
      return;
    }

    setIsCheckingContract(true);
    setContractCheckResult(null);

    try {
      const response = await fetch(
        `https://n8n.citictel.com/webhook/eregister-contractno?contractnumber=${formData.contractNumber}`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('n8n:n8n123')
          }
        }
      );

      const data = await response.json();
      
      // If response is empty array, contract doesn't exist - FAIL
      // If response has data, contract exists - PASS
      if (Array.isArray(data) && data.length === 0) {
        // Contract doesn't exist - FAIL
        setContractCheckResult({
          passed: false,
          contractNumber: formData.contractNumber
        });
        setShowError({
          show: true,
          message: `Contract ${formData.contractNumber} not found in system - cannot proceed`
        });
      } else if (Array.isArray(data) && data.length > 0) {
        // Contract exists - PASS
        setContractCheckResult({
          passed: true,
          contractNumber: formData.contractNumber
        });
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Contract check error:', error);
      setShowError({
        show: true,
        message: `Failed to check contract: ${error.message}`
      });
      setContractCheckResult({
        passed: 'error',
        contractNumber: formData.contractNumber
      });
    } finally {
      setIsCheckingContract(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.file) {
      newErrors.file = 'Please upload contract file';
    }
    setErrors(newErrors);
    setTouched({ file: true, contractNumber: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // If contract number was entered, always check it first before submitting
    if (formData.contractNumber.trim()) {
      // Check if we need to run the contract check
      if (!contractCheckResult || contractCheckResult.passed !== true) {
        await handleCheckContract();
        
        // If contract check failed after auto-check, stop submission
        // The helper text will show "FAIL - Contract not found in system"
        if (contractCheckResult?.passed !== true) {
          return;
        }
      }
    }

    if (!validateForm()) return;

    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('template', formData.template);
      uploadData.append('contractNumber', formData.contractNumber);
      uploadData.append('auditor', user?.username || '');

      const response = await fetch('https://n8n.citictel.com/webhook/contract-summary', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: uploadData,
        mode: 'cors'
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorDetail = responseText;
        try {
          const errorData = JSON.parse(responseText);
          errorDetail = errorData.message || errorData.error || errorData.detail || responseText;
        } catch {}
        throw new Error(errorDetail || `Server error: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error('Server returned invalid JSON format');
      }

      if (result.code >= 400) {
        setShowError({
          show: true,
          message: result.message || 'Upload failed'
        });
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/contracts');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      const message = error.message?.includes('Failed to fetch')
        ? 'Network error: Cannot connect to server'
        : error.message || 'Upload failed';
      
      setShowError({
        show: true,
        message: message.length > 200 ? message.substring(0, 197) + '...' : message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/contracts');
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, file: null }));
  };

  return (
    <Container maxWidth={isMobile ? 'sm' : 'md'}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 6 }}>
        <Card 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Upload Contract
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Submit your contract for AI-powered review
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Contract File
                  </Typography>
                  <Paper
                    variant="outlined"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                      p: { xs: 2, md: 3 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      minHeight: { xs: 160, md: 200 },
                      border: formData.file 
                        ? '2px solid' 
                        : dragActive 
                          ? '2px dashed' 
                          : errors.file 
                            ? '2px solid' 
                            : '2px dashed',
                      borderColor: formData.file 
                        ? 'success.main'
                        : dragActive 
                          ? 'primary.main'
                          : errors.file 
                            ? 'error.main' 
                            : 'divider',
                      bgcolor: dragActive 
                        ? 'primary.main' 
                        : errors.file 
                          ? 'error.light'
                          : formData.file
                            ? 'success.light'
                            : 'action.hover',
                      color: dragActive 
                        ? 'primary.contrastText'
                        : 'text.primary',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: formData.file ? 'default' : 'pointer',
                      '&:hover': formData.file ? {} : {
                        bgcolor: 'action.selected',
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                    onClick={() => !formData.file && document.getElementById('file-upload')?.click()}
                  >
                    {formData.file ? (
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 2 }}>
                        <Box 
                          sx={{ 
                            bgcolor: 'success.main', 
                            borderRadius: 2, 
                            p: 1.5, 
                            mr: 2 
                          }}
                        >
                          <CheckIcon sx={{ color: 'success.contrastText', fontSize: 32 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formData.file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(formData.file.size / 1024).toFixed(2)} KB
                          </Typography>
                          <Chip 
                            size="small"
                            label="Ready for upload"
                            color="success"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        <IconButton 
                          size="small"
                          onClick={handleRemoveFile}
                          sx={{ 
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' }
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        <Box 
                          sx={{ 
                            bgcolor: dragActive ? 'rgba(255,255,255,0.2)' : 'action.selected',
                            borderRadius: '50%',
                            p: 2,
                            mb: 2
                          }}
                        >
                          <UploadIcon 
                            sx={{ 
                              fontSize: 48,
                              color: dragActive ? 'inherit' : 'primary.main', 
                            }} 
                          />
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          {dragActive ? 'Drop file here' : 'Click or drag file here'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={dragActive ? 'inherit' : 'text.secondary'}
                          sx={{ mb: 2, textAlign: 'center' }}
                        >
                          Supported formats: PDF, DOC, DOCX
                        </Typography>
                        <input
                          accept=".pdf,.doc,.docx"
                          id="file-upload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <Button 
                          variant="contained" 
                          component="span"
                          disableElevation
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        >
                          Select File
                        </Button>
                      </>
                    )}
                  </Paper>

                  {touched.file && errors.file && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <InfoIcon sx={{ fontSize: 16, mr: 1, color: 'error.main' }} />
                      <Typography variant="caption" color="error">
                        {errors.file}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contractNumber"
                  name="contractNumber"
                  label="Contract Number"
                  value={formData.contractNumber}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('contractNumber')}
                  variant="outlined"
                  placeholder="Enter contract reference number"
                  helperText={
                    contractCheckResult?.passed === false
                      ? 'FAIL - Contract not found in system'
                      : contractCheckResult?.passed === true
                        ? 'PASS - Contract verified'
                        : contractCheckResult?.passed === 'error'
                          ? 'Error checking contract'
                          : touched.contractNumber && errors.contractNumber
                            ? errors.contractNumber
                            : ''
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: contractCheckResult?.passed === true ? 'success.main' : 'inherit'
                    }
                  }}
                  error={contractCheckResult?.passed === false || (touched.contractNumber && !!errors.contractNumber)}
                  disabled={isUploading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleCheckContract}
                          disabled={isCheckingContract || !formData.contractNumber.trim() || isUploading}
                          startIcon={isCheckingContract ? <CircularProgress size={16} /> : <SearchIcon />}
                          sx={{
                            minWidth: 100,
                            color: contractCheckResult?.passed === true
                              ? 'success.main'
                              : contractCheckResult?.passed === false
                                ? 'error.main'
                                : contractCheckResult?.passed === 'error'
                                  ? 'warning.main'
                                  : 'primary.main',
                            fontWeight: 600
                          }}
                        >
                          {isCheckingContract ? 'Checking...' : 'Check'}
                        </Button>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  mt: { xs: 2, md: 3 },
                  pt: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  gap: 2
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isUploading}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 3,
                      py: 1.25,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isUploading || !formData.file || contractCheckResult?.passed === false}
                    startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 4,
                      py: 1.25,
                    }}
                  >
                    {isUploading ? 'Uploading...' : 'Submit Contract'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isUploading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <CircularProgress color="inherit" size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
            Uploading contract...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Please wait while we process your file
          </Typography>
        </Box>
      </Backdrop>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 24 }
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Contract uploaded successfully!
            </Typography>
            <Typography variant="caption">
              Redirecting to contract list...
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError.show}
        autoHideDuration={6000}
        onClose={() => setShowError({ show: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowError({ show: false, message: '' })} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 24 }
          }}
        >
          {showError.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContractUpload;
