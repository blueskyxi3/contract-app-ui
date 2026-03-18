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
  Snackbar
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
  Download as DownloadIcon
} from '@mui/icons-material';

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
      setIsLoading(true);
      try {
        // Build request URL
        const requestUrl = `https://n8n.citictel.com/webhook/contract?id=${id}`;
        console.log('Request URL:', requestUrl);

        // Send request
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

        // Check response content type
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);

        // Get response text first, then try to parse
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

        // Process returned data
        if (Array.isArray(data) && data.length > 0) {
          const contractData = data[0];
          setContract(contractData);
          
          // Initialize form data, including contract summary information
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
        } else {
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

  // Build summary data object for download
  const buildSummaryData = () => {
    return {
      contract_summary: {
        // Basic contract information
        contract_no: contract?.contract_no || '',
        contract_type: contract?.contract_type || '',
        contract_status: contract?.contract_status || '',
        auditor: contract?.auditor || '',
        created_at: contract?.created_at || '',

        // Contract summary data
        client_party: formData.client_party,
        receiving_party: formData.receiving_party,
        party_country: formData.party_country,
        party_type: formData.party_type,
        contract_summary: formData.contract_summary,
        confidentiality_period: formData.confidentiality_period,
        arbitration_law: formData.arbitration_law,
        
        // 新增字段
        effective_date_applicable: formData.effective_date_applicable,
        effective_date: formData.effective_date,
        new_existing: formData.new_existing,
        end_date_applicable: formData.end_date_applicable,
        company_search: formData.company_search,
        account_manager: formData.account_manager,
        sanction_check: formData.sanction_check,
        standard_template: formData.standard_template,
        payment_terms: formData.payment_terms,
        credit_limit: formData.credit_limit,
        limitation_liability: formData.limitation_liability,
        force_majeure: formData.force_majeure,
        indemnification: formData.indemnification,
        special_commercial: formData.special_commercial,
        service_fees: formData.service_fees,
        remarks: formData.remarks,
        
        // Download timestamp
        download_time: new Date().toISOString()
      }
    };
  };

  // Handle download summary
  const handleDownloadSummary = () => {
    window.open(`https://n8n.citictel.com/webhook/contract/excel?id=${id}`, '_blank');
  };

  // Format date
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
      // Open new tab to download contract
      window.open(contract.link, '_blank');
    } else {
      setSnackbar({
        open: true,
        message: 'Unable to get contract download link',
        severity: 'warning'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress size={24} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error && !contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Contract List
        </Button>
      </Box>
    );
  }

  if (!contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          Contract information not found
        </Typography>
        <Button
          variant="contained"
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Contract List
        </Button>
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Breadcrumb navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/contracts">
          Contract List
        </Link>
        <Typography color="textPrimary">Contract Review</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">
          Contract Review
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Left: Contract original file display */}
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon />
                Contract Original File
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: 'fit-content',
                  minHeight: '1200px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden' 
                }}
              >
                {contract.link ? (
                  <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                    {contract.link.endsWith('.pdf') ? (
                      <iframe
                        src={contract.link}
                        width="100%"
                        height="100%"
                        title="Contract PDF File"
                        style={{ 
                          border: 'none',
                          minHeight: '1100px'
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 4,
                        minHeight: '1100px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Typography variant="body1" gutterBottom>
                          Contract file type: {contract.link.split('.').pop().toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Click the button below to download and view the contract file
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<DescriptionIcon />}
                          onClick={handleDownload}
                          sx={{ mt: 2 }}
                        >
                          Download Contract File
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    minHeight: '1100px'
                  }}>
                    <Typography variant="body1" color="textSecondary">
                      No contract file link
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Right: Contract basic information and summary information */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                {/* Contract basic information */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <DescriptionIcon />
                    Contract Number
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            {contract.contract_no}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Contract summary information - now editable */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    <AssignmentIcon />
                    Contract Summary Information
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      height: '1100px',
                      overflow: 'auto' 
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          <PersonIcon />
                          Name of the parties to the contract
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="client_party"
                          value={formData.client_party}
                          onChange={handleInputChange}
                          placeholder="Enter disclosing party information"
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          sx={{ mt: 1 }}
                          name="receiving_party"
                          value={formData.receiving_party}
                          onChange={handleInputChange}
                          placeholder="Enter receiving party information"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          <PublicIcon />
                          Counterparty's country/ region
                        </Typography>
                        <TextField
                          fullWidth
                          name="party_country"
                          value={formData.party_country}
                          onChange={handleInputChange}
                          placeholder="Enter counterparty country/region"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          <BusinessIcon />
                          Counterparty's designation
                        </Typography>
                        <TextField
                          fullWidth
                          name="party_type"
                          value={formData.party_type}
                          onChange={handleInputChange}
                          placeholder="Enter counterparty designation (e.g., customer, supplier, etc.)"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          <DescriptionIcon />
                          Brief service description of this contract
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="contract_summary"
                          value={formData.contract_summary}
                          onChange={handleInputChange}
                          placeholder="Enter brief service description of the contract"
                        />
                      </Grid>
                      
                      {/* 新增的字段 */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Effective Date Applicable
                        </Typography>
                        <TextField
                          fullWidth
                          name="effective_date_applicable"
                          value={formData.effective_date_applicable}
                          onChange={handleInputChange}
                          placeholder="Enter effective date applicability"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Effective Date
                        </Typography>
                        <TextField
                          fullWidth
                       
                          name="effective_date"
                          value={formData.effective_date_str}
                          onChange={handleInputChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          New/Existing
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          name="new_existing"
                          value={formData.new_existing}
                          onChange={handleInputChange}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value=""></option>
                          <option value="新">新</option>
                          <option value="已存在">已存在</option>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          End Date Applicable
                        </Typography>
                        <TextField
                          fullWidth
                          name="end_date_applicable"
                          value={formData.end_date_applicable}
                          onChange={handleInputChange}
                          placeholder="Enter end date applicability"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Company Search
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          name="company_search"
                          value={formData.company_search}
                          onChange={handleInputChange}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value=""></option>
                          <option value="有">有</option>
                          <option value="没有">没有</option>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Account Manager
                        </Typography>
                        <TextField
                          fullWidth
                          name="account_manager"
                          value={formData.account_manager}
                          onChange={handleInputChange}
                          placeholder="Enter account manager"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Sanction Check
                        </Typography>
                        <TextField
                          fullWidth
                          name="sanction_check"
                          value={formData.sanction_check}
                          onChange={handleInputChange}
                          placeholder="Enter sanction check details"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Standard Template
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          name="standard_template"
                          value={formData.standard_template}
                          onChange={handleInputChange}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value=""></option>
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Payment Terms
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="payment_terms"
                          value={formData.payment_terms}
                          onChange={handleInputChange}
                          placeholder="Enter payment terms"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Credit Limit
                        </Typography>
                        <TextField
                          fullWidth
                          name="credit_limit"
                          value={formData.credit_limit}
                          onChange={handleInputChange}
                          placeholder="Enter credit limit"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Limitation of Liability
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="limitation_liability"
                          value={formData.limitation_liability}
                          onChange={handleInputChange}
                          placeholder="Enter limitation of liability details"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Force Majeure
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="force_majeure"
                          value={formData.force_majeure}
                          onChange={handleInputChange}
                          placeholder="Enter force majeure clause"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Indemnification
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="indemnification"
                          value={formData.indemnification}
                          onChange={handleInputChange}
                          placeholder="Enter indemnification clause"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Special Commercial Terms
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="special_commercial"
                          value={formData.special_commercial}
                          onChange={handleInputChange}
                          placeholder="Enter special commercial terms"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Service Fees
                        </Typography>
                        <TextField
                          fullWidth
                          name="service_fees"
                          value={formData.service_fees}
                          onChange={handleInputChange}
                          placeholder="Enter service fees"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          <CalendarIcon />
                          Contract Period/ Additional Information
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="confidentiality_period"
                          value={formData.confidentiality_period}
                          onChange={handleInputChange}
                          placeholder="Enter contract period/additional information"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          <GavelIcon />
                          Limitation of liability
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="arbitration_law"
                          value={formData.arbitration_law}
                          onChange={handleInputChange}
                          placeholder="Enter limitation of liability clause"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Remarks
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          placeholder="Enter any remarks"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleDownload}
                  sx={{ mr: 2 }}
                  disabled={isSubmitting}
                  startIcon={<DownloadIcon />}
                >
                  Download Contract
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{ mr: 2 }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownloadSummary}
                  disabled={isSubmitting}
                  startIcon={<DownloadIcon />}
                >
                  Download Summary
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContractReview;