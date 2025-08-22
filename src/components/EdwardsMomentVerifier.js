import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserMoments } from '../services/momentService';
import { verifyEdwardsMomentOwnership } from '../services/verificationDbService';
import { Button, Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';

const EdwardsMomentVerifier = ({ requiredCount = 1 }) => {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!user?.addr) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setVerifying(true);
      setError(null);
      setResult(null);

      // Get user's moments
      const moments = await getUserMoments(user.addr);
      
      // Verify ownership of Anthony Edwards moment
      const verificationResult = await verifyEdwardsMomentOwnership(
        user.addr,
        moments,
        requiredCount
      );
      
      setResult(verificationResult);
    } catch (err) {
      console.error("Verification error:", err);
      setError(`Error during verification: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Anthony Edwards Moment Verification
      </Typography>
      
      <Typography variant="body1" paragraph>
        Verify that you own at least {requiredCount} Anthony Edwards "Jump Shot" moment(s) 
        from the "Crunch Time" set to qualify for rewards.
      </Typography>
      
      <Box sx={{ my: 3 }}>
        {!user?.addr ? (
          <Alert severity="info">Please connect your wallet to verify your moments</Alert>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleVerify}
            disabled={verifying}
            fullWidth
          >
            {verifying ? <CircularProgress size={24} color="inherit" /> : 'Verify Ownership'}
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      
      {result && (
        <Alert 
          severity={result.verified ? "success" : "warning"} 
          sx={{ mt: 2 }}
        >
          {result.message}
        </Alert>
      )}
    </Paper>
  );
};

export default EdwardsMomentVerifier;
