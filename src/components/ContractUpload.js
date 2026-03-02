import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      // Clear file error
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
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
    if (validateForm()) {
      setIsUploading(true);

      try {
        // Create FormData object for file upload
        const uploadData = new FormData();
        uploadData.append('file', formData.file);
        uploadData.append('template', formData.template);
        uploadData.append('contractNumber', formData.contractNumber);
        
        // Call API to submit form
        const response = await fetch('https://n8n.citictel.com/webhook/contract-summary', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body: uploadData,
          mode: 'cors'
        });
        
        // Get response text
        const responseText = await response.text();
       
        if (!response.ok) {
          // Try to parse error message
          let errorDetail = '';
          try {
            const errorData = JSON.parse(responseText);
            // Try multiple possible error fields
            errorDetail = errorData.message || 
                         errorData.error || 
                         errorData.detail || 
                         errorData.error_description ||
                         (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
          } catch {
            errorDetail = responseText || `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorDetail);
        }

        // Parse successful response
        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error('Server returned invalid JSON format');
        }
        
        console.log('Upload result:', result);
        
        // Check if returned code is >=400
        if (result.code >= 400) {
          // Show error notification
          const errorMessage = result.message || 'Upload failed, please try again later';
          setShowError({
            show: true,
            message: errorMessage
          });
          setIsUploading(false);
          return;
        }
        
        // If code < 400, consider it successful
        // Show success notification
        setShowSuccess(true);
        // Automatically close notification and return after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/');
        }, 3000);
        
      } catch (error) {
        console.error('Upload error:', error);
        let errorMessage = 'Upload failed';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to server. Please check network connection or contact administrator.';
        } else if (error.message) {
          // Ensure error message is clear and readable
          errorMessage = error.message.length > 200 
            ? error.message.substring(0, 200) + '...' 
            : errorMessage;
        }
        
        // Show error notification
        setShowError({
          show: true,
          message: errorMessage
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
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
              {/* 文件上传区域 - 上方 */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      minHeight: 180,
                      border: errors.file ? '1px solid #f44336' : '1px dashed rgba(0, 0, 0, 0.23)',
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => !formData.file && document.getElementById('file-upload').click()}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        <UploadIcon sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.23)', mb: 2 }} />
                        <Typography variant="body2" color="textSecondary" gutterBottom align="center">
                          Click or drag file here to upload
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
                        <Button variant="contained" component="span">
                          Select File
                        </Button>
                      </>
                    )}
                  </Paper>
                  {errors.file && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.file}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              {/* e-Register/VOSS区域 - 下方 */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
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
                </Box>
              </Grid>
              
              {/* 按钮区域 */}
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
      
      {/* Loading overlay during upload */}
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
      
      {/* Success notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Contract uploaded successfully! Auto returning to list page in 3 seconds...
        </Alert>
      </Snackbar>

      {/* Error notification */}
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