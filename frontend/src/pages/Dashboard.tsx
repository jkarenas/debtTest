// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { debtsAPI } from '../service/api';
import { Debt, DebtStatus, DebtSummary } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<DebtStatus | 'ALL'>('ALL');
  const [actionLoading, setActionLoading] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [debtsData, summaryData] = await Promise.all([
        debtsAPI.getAll(filter === 'ALL' ? undefined : filter),
        debtsAPI.getSummary(),
      ]);
      setDebts(debtsData);
      setSummary(summaryData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      setActionLoading(id);
      await debtsAPI.markAsPaid(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark debt as paid');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        setActionLoading(id);
        await debtsAPI.delete(id);
        await loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete debt');
      } finally {
        setActionLoading('');
      }
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            My Debts Dashboard
          </Typography>
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-debt')}
            >
              Add New Debt
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
                <CardContent sx={{ color: 'white' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    <Typography color="inherit" variant="h6">
                      Total Debts
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {summary.totalDebts}
                  </Typography>
                  <Typography variant="body2">
                    ${summary.totalAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(45deg, #FF6B6B 30%, #FFE66D 90%)' }}>
                <CardContent sx={{ color: 'white' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography color="inherit" variant="h6">
                      Pending Debts
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {summary.pendingDebts}
                  </Typography>
                  <Typography variant="body2">
                    ${summary.pendingAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
                <CardContent sx={{ color: 'white' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingDownIcon sx={{ mr: 1 }} />
                    <Typography color="inherit" variant="h6">
                      Paid Debts
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {summary.paidDebts}
                  </Typography>
                  <Typography variant="body2">
                    ${summary.paidAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filter}
              label="Filter by Status"
              onChange={(e) => setFilter(e.target.value as DebtStatus | 'ALL')}
            >
              <MenuItem value="ALL">All Debts</MenuItem>
              <MenuItem value={DebtStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={DebtStatus.PAID}>Paid</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Debts Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                {!isMobile && <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>}
                {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Paid Date</TableCell>}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {debts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 4 : 6} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        No debts found.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/create-debt')}
                      >
                        Create your first debt!
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                debts.map((debt) => (
                  <TableRow key={debt.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {debt.description}
                      </Typography>
                      {isMobile && (
                        <Typography variant="caption" color="textSecondary">
                          ${Number(debt.amount).toFixed(2)} - {format(new Date(debt.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          ${Number(debt.amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={debt.status}
                        color={getStatusColor(debt.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>
                          {format(new Date(debt.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {debt.paidAt ? format(new Date(debt.paidAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                      </>
                    )}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/debt/${debt.id}`)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      {debt.status === DebtStatus.PENDING && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsPaid(debt.id)}
                            disabled={actionLoading === debt.id}
                            title="Mark as Paid"
                            color="success"
                          >
                            {actionLoading === debt.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <PaymentIcon />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/debt/${debt.id}?edit=true`)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(debt.id)}
                            disabled={actionLoading === debt.id}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Floating Action Button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/create-debt')}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default Dashboard;