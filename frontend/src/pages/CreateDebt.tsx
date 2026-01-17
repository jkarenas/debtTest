// src/pages/CreateDebt.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { debtsAPI } from '../service/api';
import { CreateDebtData } from '../types';

const CreateDebt: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDebtData>();

  const onSubmit = async (data: CreateDebtData) => {
    setIsLoading(true);
    setError('');
    try {
      await debtsAPI.create({
        amount: Number(data.amount),
        description: data.description,
      });
      navigate('/', { state: { message: 'Debt created successfully!' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create debt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    navigate('/');
  };

  return (
    <Container component="main" maxWidth="sm">
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

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" gutterBottom align="center">
            Create New Debt
          </Typography>
          
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Add a new debt to track your financial obligations
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              placeholder="e.g., Loan from John for dinner"
              autoFocus
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
              helperText={errors.description?.message || 'Describe what this debt is for'}
              variant="outlined"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount"
              placeholder="0.00"
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
              helperText={errors.amount?.message || 'Enter the debt amount in USD'}
              variant="outlined"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Creating...' : 'Create Debt'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCancel}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateDebt;