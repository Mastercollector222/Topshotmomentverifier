import React, { useState, useEffect } from 'react';
import { getVerifiedAddresses } from '../services/verificationDbService';
import { useAdmin } from '../hooks/useAdmin';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

const AdminDashboard = () => {
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAdmin, loading: adminLoading, error: adminError, adminLogin } = useAdmin();
  
  // Login dialog state
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const fetchVerifiedUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      setError(null);
      const users = await getVerifiedAddresses();
      setVerifiedUsers(users);
    } catch (err) {
      console.error("Error fetching verified users:", err);
      setError(`Failed to load verified users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchVerifiedUsers();
    }
  }, [isAdmin]);
  
  const handleLoginOpen = () => {
    setLoginOpen(true);
    setLoginError(null);
  };
  
  const handleLoginClose = () => {
    setLoginOpen(false);
  };
  
  const handleLogin = async () => {
    try {
      setLoginError(null);
      const success = await adminLogin(email, password);
      if (success) {
        setLoginOpen(false);
        fetchVerifiedUsers();
      }
    } catch (err) {
      setLoginError("Invalid email or password");
    }
  };

  const handleRefresh = () => {
    fetchVerifiedUsers();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Firebase timestamp has seconds and nanoseconds
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Verified Addresses Dashboard
        </Typography>
        {isAdmin && (
          <Button 
            variant="outlined" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            Refresh
          </Button>
        )}
      </Box>

      {adminError && (
        <Alert severity="error" sx={{ mb: 3 }}>{adminError}</Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {adminLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : !isAdmin ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            You need admin privileges to view this dashboard
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLoginOpen}
          >
            Admin Login
          </Button>
        </Box>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Total verified users: {verifiedUsers.length}
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Flow Address</TableCell>
                  <TableCell align="center">Moment Count</TableCell>
                  <TableCell align="center">Verified At</TableCell>
                  <TableCell align="center">Last Checked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verifiedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No verified users found
                    </TableCell>
                  </TableRow>
                ) : (
                  verifiedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell component="th" scope="row">
                        {user.address}
                      </TableCell>
                      <TableCell align="center">{user.momentCount}</TableCell>
                      <TableCell align="center">{formatDate(user.verifiedAt)}</TableCell>
                      <TableCell align="center">{formatDate(user.lastCheckedAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {/* Admin Login Dialog */}
      <Dialog open={loginOpen} onClose={handleLoginClose}>
        <DialogTitle>Admin Login</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your admin credentials to access the dashboard.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError && (
            <Alert severity="error" sx={{ mt: 2 }}>{loginError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginClose}>Cancel</Button>
          <Button onClick={handleLogin} variant="contained" color="primary">
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminDashboard;
