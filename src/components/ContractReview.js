import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Stack,
  CardHeader,
  IconButton,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';

// Status mapping
const statusMap = {
  'initialized': { label: 'Initialized', color: 'default' },
  'processing': { label: 'Processing', color: 'primary' },
  'completed': { label: 'Completed', color: 'success' },
  'reviewed': { label: 'Reviewed', color: 'info' },
  'error': { label: 'Error', color: 'error' }
};

const ContractReview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Log the ID immediately when component mounts
  console.log('ContractReview component mounted');
  console.log('ID from URL params:', id);
  console.log('ID type:', typeof id);
  
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Initial form data
  const [formData, setFormData] = useState({
    contractId: id,
    client_party: '',
    receiving_party: '',
    party_country: '',
    party_type: '',
    contract_summary: '',
    confidentiality_period: '',
    arbitration_law: '',
    // 新增字段
    effective_date_applicable: '',
    effective_date: '',
    new_existing: '',
    end_date_applicable: '',
    company_search: '',
    account_manager: '',
    sanction_check: '',
    standard_template: '',
    payment_terms: '',
    credit_limit: '',
    limitation_liability: '',
    force_majeure: '',
    indemnification: '',
    special_commercial: '',
    service_fees: '',
    remarks: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchContract = async () => {
      // Validate ID before making API call
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid contract ID in URL:', id);
        setError('Invalid contract ID. Please return to the contract list and try again.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const requestUrl = `https://n8n.citictel.com/webhook/contract?id=${id}`;
        console.log('Request URL:', requestUrl);

        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Query failed: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);

        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        if (!responseText || responseText.trim() === '') {
          throw new Error('Server returned empty response');
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error(`Response data is not valid JSON format: ${jsonError.message}`);
        }

        console.log('Contract data fetched successfully:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Data keys:', Object.keys(data));

        // Process returned data - support multiple response formats
        let contractData = null;
        
        if (Array.isArray(data) && data.length > 0) {
          // Array format
          contractData = data[0];
          console.log('Using array format, contractData:', contractData);
        } else if (data && typeof data === 'object') {
          // Object format - check for common field names
          if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
            contractData = data.rows[0];
            console.log('Using rows format, contractData:', contractData);
          } else if (data.contracts && Array.isArray(data.contracts) && data.contracts.length > 0) {
            contractData = data.contracts[0];
            console.log('Using contracts format, contractData:', contractData);
          } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            contractData = data.data[0];
            console.log('Using data format, contractData:', contractData);
          } else if (data.id || data.contract_no) {
            // Single contract object
            contractData = data;
            console.log('Using single object format, contractData:', contractData);
          }
        }

        if (contractData) {
          setContract(contractData);
          
          setFormData(prev => ({
            ...prev,
            client_party: contractData.client_party || '',
            receiving_party: contractData.receiving_party || '',
            party_country: contractData.party_country || '',
            party_type: contractData.party_type || '',
            contract_summary: contractData.contract_summary || '',
            confidentiality_period: contractData.confidentiality_period || '',
            arbitration_law: contractData.arbitration_law || '',
            // 新增字段初始化
            effective_date_applicable: contractData.effective_date_applicable || '',
            effective_date: contractData.effective_date || '',
            new_existing: contractData.new_existing || '',
            end_date_applicable: contractData.end_date_applicable || '',
            company_search: contractData.company_search || '',
            account_manager: contractData.account_manager || '',
            sanction_check: contractData.sanction_check || '',
            standard_template: contractData.standard_template || '',
            payment_terms: contractData.payment_terms || '',
            credit_limit: contractData.credit_limit || '',
            limitation_liability: contractData.limitation_liability || '',
            force_majeure: contractData.force_majeure || '',
            indemnification: contractData.indemnification || '',
            special_commercial: contractData.special_commercial || '',
            service_fees: contractData.service_fees || '',
            remarks: contractData.remarks || '',
          }));
          
          console.log('Contract state set successfully:', contractData);
        } else {
          console.error('Could not extract contract data from response');
          console.error('Full response structure:', JSON.stringify(data, null, 2));
          throw new Error('Specified contract not found');
        }
      } catch (error) {
        console.error('Error fetching contract data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  const handleBack = () => {
    navigate('/contracts');
  };

  const handleDownload = () => {
    if (contract && contract.link) {
      window.open(contract.link, '_blank');
    } else {
      setSnackbar({
        open: true,
        message: 'Unable to get contract download link',
        severity: 'warning'
      });
    }
  };

  const handleDownloadSummary = () => {
    window.open(`https://n8n.citictel.com/webhook/contract/excel?id=${id}`, '_blank');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 128px)',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
          Loading contract...
        </Typography>
      </Box>
    );
  }

  if (error && !contract) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 128px)',
        p: 3
      }}>
        <InfoIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleBack}
          startIcon={<BackIcon />}
          sx={{ 
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          Back to Contract List
        </Button>
      </Box>
    );
  }

  if (!contract) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 128px)',
        p: 3
      }}>
        <InfoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Contract information not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Message notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {!isSmallScreen && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link 
              color="inherit" 
              onClick={handleBack}
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              Contract List
            </Link>
            <Typography color="text.primary">Contract Review</Typography>
          </Breadcrumbs>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleBack}
              sx={{ 
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Back
            </Button>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Contract Review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contract.contract_no || 'Unknown Contract'}
              </Typography>
            </Box>
          </Box>
          
          <Chip
            label={statusMap[contract.contract_status?.toLowerCase()]?.label || contract.contract_status}
            color={statusMap[contract.contract_status?.toLowerCase()]?.color || 'default'}
            size="small"
            sx={{ 
              fontWeight: 600,
              borderRadius: 2
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left: Contract original file display */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contract Document
                  </Typography>
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: isMobile ? '600px' : '800px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  borderRadius: 2
                }}
              >
                {contract.link ? (
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {contract.link.endsWith('.pdf') ? (
                      <iframe
                        src={contract.link}
                        width="100%"
                        height="100%"
                        title="Contract PDF File"
                        style={{ 
                          border: 'none',
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 4,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <DescriptionIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          {contract.link.split('.').pop().toUpperCase()} File
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Click button below to download and view contract file
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownload}
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 2
                          }}
                        >
                          Download Contract
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.disabled">
                        No contract file link
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Contract summary information */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contract Summary
                  </Typography>
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  maxHeight: isMobile ? '600px' : '800px',
                  overflow: 'auto',
                  borderRadius: 2
                }}
              >
                <Grid container spacing={2}>
                  {/* Section 1: Parties Information */}
                  <Grid item xs={12}>
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Parties Information
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Client Party"
                              name="client_party"
                              value={formData.client_party}
                              onChange={handleInputChange}
                              placeholder="Enter disclosing party information"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Receiving Party"
                              name="receiving_party"
                              value={formData.receiving_party}
                              onChange={handleInputChange}
                              placeholder="Enter receiving party information"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Party Country"
                              name="party_country"
                              value={formData.party_country}
                              onChange={handleInputChange}
                              placeholder="Country/Region"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Party Type"
                              name="party_type"
                              value={formData.party_type}
                              onChange={handleInputChange}
                              placeholder="Designation"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Section 2: Contract Details */}
                  <Grid item xs={12}>
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Contract Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Contract Summary"
                              name="contract_summary"
                              value={formData.contract_summary}
                              onChange={handleInputChange}
                              placeholder="Brief service description"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Effective Date"
                              name="effective_date"
                              value={formData.effective_date}
                              onChange={handleInputChange}
                              placeholder="Effective date"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="New/Existing"
                              name="new_existing"
                              value={formData.new_existing}
                              onChange={handleInputChange}
                              select
                              size="small"
                            >
                              <MenuItem value="">Select</MenuItem>
                              <MenuItem value="新">New (新)</MenuItem>
                              <MenuItem value="已存在">Existing (已存在)</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Confidentiality Period"
                              name="confidentiality_period"
                              value={formData.confidentiality_period}
                              onChange={handleInputChange}
                              placeholder="Contract period"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Section 3: Business Terms */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Business Terms
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Company Search"
                              name="company_search"
                              value={formData.company_search}
                              onChange={handleInputChange}
                              select
                              size="small"
                            >
                              <MenuItem value="">Select</MenuItem>
                              <MenuItem value="有">Yes (有)</MenuItem>
                              <MenuItem value="没有">No (没有)</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Account Manager"
                              name="account_manager"
                              value={formData.account_manager}
                              onChange={handleInputChange}
                              placeholder="Manager"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Sanction Check"
                              name="sanction_check"
                              value={formData.sanction_check}
                              onChange={handleInputChange}
                              placeholder="Sanction check details"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Standard Template"
                              name="standard_template"
                              value={formData.standard_template}
                              onChange={handleInputChange}
                              select
                              size="small"
                            >
                              <MenuItem value="">Select</MenuItem>
                              <MenuItem value="是">Yes (是)</MenuItem>
                              <MenuItem value="否">No (否)</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Service Fees"
                              name="service_fees"
                              value={formData.service_fees}
                              onChange={handleInputChange}
                              placeholder="Service fees"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Section 4: Legal Terms */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          <GavelIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Legal Terms
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Payment Terms"
                              name="payment_terms"
                              value={formData.payment_terms}
                              onChange={handleInputChange}
                              placeholder="Payment terms"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Limitation of Liability"
                              name="limitation_liability"
                              value={formData.limitation_liability}
                              onChange={handleInputChange}
                              placeholder="Liability limitations"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Force Majeure"
                              name="force_majeure"
                              value={formData.force_majeure}
                              onChange={handleInputChange}
                              placeholder="Force majeure clause"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Indemnification"
                              name="indemnification"
                              value={formData.indemnification}
                              onChange={handleInputChange}
                              placeholder="Indemnification clause"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Arbitration Law"
                              name="arbitration_law"
                              value={formData.arbitration_law}
                              onChange={handleInputChange}
                              placeholder="Governing law"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Section 5: Additional Information */}
                  <Grid item xs={12}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Additional Information
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              label="Special Commercial Terms"
                              name="special_commercial"
                              value={formData.special_commercial}
                              onChange={handleInputChange}
                              placeholder="Special commercial terms"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label="Remarks"
                              name="remarks"
                              value={formData.remarks}
                              onChange={handleInputChange}
                              placeholder="Additional remarks"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Button
              variant="outlined"
              onClick={handleDownload}
              disabled={isSubmitting}
              startIcon={<DownloadIcon />}
              sx={{ 
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Download Contract
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadSummary}
              disabled={isSubmitting}
              startIcon={<DownloadIcon />}
              sx={{ 
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Download Summary
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractReview;
