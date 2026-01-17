// src/pages/DebtDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { debtsAPI } from '../service/api';
import { Debt, DebtStatus, UpdateDebtData } from '../types';

const DebtDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isEditMode = searchParams.get('edit') === 'true';

  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDebtData>();

  useEffect(() => {
    if (id) {
      loadDebt();
    }
  }, [id]);

  useEffect(() => {
    if (debt) {
      reset({
        amount: debt.amount,
        description: debt.description,
      });
    }
  }, [debt, reset]);

  const loadDebt = async () => {
    try {
      setLoading(true);
      const debtData = await debtsAPI.getById(id!);
      setDebt(debtData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load debt');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (window.confirm('Are you sure you want to mark this debt as paid? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await debtsAPI.markAsPaid(id!);
        await loadDebt();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to mark debt as paid');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this debt? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await debtsAPI.delete(id!);
        navigate('/', { state: { message: 'Debt deleted successfully!' } });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete debt');
        setActionLoading(false);
      }
    }
  };

  const onSubmit = async (data: UpdateDebtData) => {
    try {
      setActionLoading(true);
      await debtsAPI.update(id!, {
        amount: Number(data.amount),
        description: data.description,
      });
      await loadDebt();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update debt');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: DebtStatus) => {
    return status === DebtStatus.PAID ? 'success' : 'warning';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!debt) {
    return (
      <Container>
        <Alert severity="error">
          Debt not found
          <Button onClick={() => navigate('/')} sx={{ ml: 2 }}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="text"
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card elevation={3}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Box>
              <Typography component="h1" variant="h5" gutterBottom>
                Debt Details
              </Typography>
              <Chip
                label={debt.status}
                color={getStatusColor(debt.status)}
                variant="filled"
                size="medium"
              />
            </Box>
            
            {!isEditing && (
              <Box display="flex" gap={1} flexWrap="wrap">
                {debt.status === DebtStatus.PENDING && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={handleMarkAsPaid}
                      disabled={actionLoading}
                      color="success"
                      size={isMobile ? 'small' : 'medium'}
                    >
                      {actionLoading ? <CircularProgress size={20} /> : 'Mark as Paid'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      disabled={actionLoading}
                      color="error"
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>

          {isEditing ? (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    label="Description"
                    multiline
                    rows={3}
                    {...register('description', {
                      required: 'Description is required',
                      maxLength: {
                        value: 500,
                        message: 'Description must be less than 500 characters',
                      },
                      minLength: {
                        value: 3,
                        message: 'Description must be at least 3 characters',
                      },
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="amount"
                    label="Amount"
                    type="number"
                    inputProps={{ 
                      step: '0.01', 
                      min: '0.01',
                      max: '999999.99'
                    }}
                    {...register('amount', {
                      required: 'Amount is required',
                      min: {
                        value: 0.01,
                        message: 'Amount must be greater than $0.00',
                      },
                      max: {
                        value: 999999.99,
                        message: 'Amount cannot exceed $999,999.99',
                      },
                    })}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={actionLoading}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {actionLoading ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      amount: debt.amount,
                      description: debt.description,
                    });
                  }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                      <MoneyIcon sx={{ mr: 1 }} />
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                      {debt.description}
                    </Typography>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Amount
                          </Typography>
                          <Typography variant="h4" color="primary" fontWeight="bold">
                            ${Number(debt.amount).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Status
                          </Typography>
                          <Typography variant="h6">
                            {debt.status}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center">
                          <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                              Created Date
                            </Typography>
                            <Typography variant="body1">
                              {format(new Date(debt.createdAt), 'MMMM dd, yyyy - HH:mm')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      {debt.paidAt && (
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center">
                            <PaymentIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Box>
                              <Typography variant="subtitle2" color="textSecondary">
                                Paid Date
                              </Typography>
                              <Typography variant="body1" color="success.main">
                                {format(new Date(debt.paidAt), 'MMMM dd, yyyy - HH:mm')}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DebtDetail;