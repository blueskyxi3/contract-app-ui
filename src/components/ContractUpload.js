import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Container
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ContractUpload = () => {
  const navigate = useNavigate();
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('template', formData.template);
      uploadData.append('contractNumber', formData.contractNumber);

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
        navigate('/');
      }, 3000);

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
    navigate('/');
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, file: null }));
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center">
              Contract Upload
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Paper
                    variant="outlined"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      minHeight: 180,
                      border: dragActive 
                        ? '2px dashed #1976d2' 
                        : errors.file 
                          ? '2px solid #f44336' 
                          : '1px dashed rgba(0, 0, 0, 0.23)',
                      bgcolor: dragActive ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s',
                      cursor: formData.file ? 'default' : 'pointer',
                      '&:hover': formData.file ? {} : {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        borderColor: 'rgba(0, 0, 0, 0.4)'
                      }
                    }}
                    onClick={() => !formData.file && document.getElementById('file-upload')?.click()}
                  >
                    {formData.file ? (
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 2 }}>
                        <FileIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {formData.file.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {(formData.file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={handleRemoveFile}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        <UploadIcon 
                          sx={{ 
                            fontSize: 48, 
                            color: dragActive ? '#1976d2' : 'rgba(0, 0, 0, 0.23)', 
                            mb: 2 
                          }} 
                        />
                        <Typography 
                          variant="body1" 
                          color={dragActive ? 'primary' : 'textSecondary'} 
                          gutterBottom 
                          align="center"
                        >
                          {dragActive ? 'Drop file here' : 'Click or drag file here to upload'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" align="center" sx={{ mb: 2 }}>
                          Supported formats: .pdf, .doc, .docx
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
                        >
                          Select File
                        </Button>
                      </>
                    )}
                  </Paper>

                  {(errors.file || dragActive) && (
                    <Typography 
                      variant="caption" 
                      color={dragActive ? 'primary' : 'error'} 
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {dragActive ? 'Release to upload' : errors.file}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contractNumber"
                  name="contractNumber"
                  label="e-Register/VOSS Number"
                  value={formData.contractNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="medium"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.12)' 
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isUploading || !formData.file}
                    startIcon={isUploading ? <CircularProgress size={20} /> : null}
                  >
                    {isUploading ? 'Uploading...' : 'Submit'}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Uploading contract, please wait...
          </Typography>
        </Box>
      </Backdrop>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Contract uploaded successfully! Auto returning in 3 seconds...
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
          sx={{ width: '100%' }}
        >
          {showError.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContractUpload;