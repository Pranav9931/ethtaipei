import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { MiniKit } from '@worldcoin/minikit-js';
import styled from 'styled-components';
import { Logo } from '../assets';

const LogoImage = styled.img`
  height: 30px;
`;

const steps = ['Uploading Asset', 'Tokenizing', 'Done'];

const Loans = () => {
  const walletAddress = MiniKit.walletAddress;
  const [file, setFile] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addressShort, setAddressShort] = useState<string>('');

  useEffect(() => {
    if (walletAddress && walletAddress.length > 0) {
      setAddressShort(walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4));
    }
  }, [walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !walletAddress) {
      alert("Please upload an asset and connect your wallet.");
      return;
    }

    const formData = new FormData();
    formData.append('asset', file);
    formData.append('owner', walletAddress);

    setOpenModal(true);
    setLoading(true);

    try {
      setActiveStep(0);
      await new Promise((res) => setTimeout(res, 1000)); // Simulate upload delay
      setActiveStep(1);

      const res = await fetch('/tokenize', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Tokenization failed.');
      }

      setActiveStep(2);
    } catch (err: any) {
      console.error("Tokenization error:", err);
      alert(err.message || 'Something went wrong.');
      setOpenModal(false);
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        mb: 4
      }}>
        <LogoImage src={Logo} alt="App Logo" />
        <Box sx={{
          padding: '10px 20px',
          background: 'black',
          color: 'white',
          borderRadius: '10px',
          textTransform: 'uppercase',
        }}>
          {addressShort}
        </Box>
      </Box>

      <Box sx={{
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '15px',
        color: 'black'
      }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>
          Tokenize Asset
        </Typography>
        <Typography sx={{ mb: 3, opacity: 0.7 }}>
          Upload a real-world asset document or image to tokenize it.
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <Button
            component="label"
            variant="outlined"
            sx={{
              background: 'white',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 500,
              padding: '12px',
              border: file ? '2px solid green' : '1px dashed gray',
              color: 'black',
              '&:hover': {
                background: 'white',
                borderColor: 'black',
              },
            }}
          >
            {file ? file.name : 'Choose Asset File'}
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) setFile(selected);
              }}
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              background: 'black',
              color: 'white',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.8)',
              },
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '15px'
            }}
          >
            Tokenize
          </Button>
        </form>
      </Box>

      <Dialog open={openModal} maxWidth="sm" fullWidth>
        <DialogTitle>Processing Tokenization</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4,
            mb: 2,
          }}>
            {loading ? (
              <>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Please wait…</Typography>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenModal(false);
                  setActiveStep(0);
                  setFile(null);
                }}
              >
                Close
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Loans;
