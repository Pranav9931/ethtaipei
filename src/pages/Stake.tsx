import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, TextField, Button, CircularProgress, Box, Typography } from '@mui/material';
import { MiniKit } from '@worldcoin/minikit-js';
import { parseEther } from 'ethers';
import abi from '../contracts/abi/main.json';
import { Abi } from 'viem';

// ERC-20 ABI for approval
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

// Transaction type
type Transaction = {
  address: string;
  abi: Abi | readonly unknown[];
  functionName: string;
  value?: string;
  args: string[];
};

// Steps for the modal
const steps = ['Approve WLD', 'Stake Tokens', 'Done'];

const Stake = () => {
    const walletAddress = MiniKit.walletAddress
  const [amount, setAmount] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const contractAddress = import.meta.env.VITE_APP_WORLD_CONTRACT_ADDRESS;
  const WLD_TOKEN_ADDRESS = import.meta.env.VITE_APP_WLD_TOKEN_ADDRESS;

  // Ensure wallet is connected
  useEffect(() => {
    if (!MiniKit.isInstalled()) {
		return
	}
  }, []);

  // Handle the staking process
  const handleStake = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert("Please enter a valid amount");
      return;
    }

    setOpenModal(true);
    setLoading(true);

    try {
      // Validate contract addresses
      if (!contractAddress || !WLD_TOKEN_ADDRESS) {
        throw new Error("Contract addresses not configured properly");
      }

      // Step 1: Approve
      const parsedAmount = parseEther(amount).toString();
      const approvalTx: Transaction = {
        address: WLD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress, parsedAmount],
      };

      const approvalRes = await MiniKit.commandsAsync.sendTransaction({
        transaction: [approvalTx]
      });

      if (approvalRes.finalPayload.status !== "success") {
        throw new Error(`Approval failed: ${approvalRes.finalPayload.details || "Unknown error"}`);
      }
      setActiveStep(1);

      // Step 2: Stake
      const stakeTx: Transaction = {
        address: contractAddress,
        abi: abi as Abi,
        functionName: "stake",
        args: [parsedAmount],
      };

      const stakeRes = await MiniKit.commandsAsync.sendTransaction({
        transaction: [stakeTx]
      });

      if (stakeRes.finalPayload.status !== "success") {
        throw new Error(`Staking failed: ${stakeRes.finalPayload.details || "Unknown error"}`);
      }

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
    <Box sx={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <Typography variant="h4" fontWeight={600}>Stake WLD</Typography>
      <Typography variant="h4" fontWeight={600}>Wallet: {walletAddress}</Typography>
      <Typography sx={{ mb: 3 }} color="text.secondary">
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
        />
        <Button type="submit" variant="contained" size="large">
          Stake
        </Button>
      </form>

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

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 4,
              mb: 2,
            }}
          >
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
    </Box>
  );
};

export default Stake;
