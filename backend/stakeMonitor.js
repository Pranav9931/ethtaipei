
const { ethers } = require('ethers');
const WorldFinanceABI = require('./contracts/abis/WorldFinance.json');

const WORLD_RPC = process.env.WORLD_RPC || "https://mainnet.worldcoin.org";
const STAKING_CONTRACT = "0x3300a4A9790b3ed5249828277aC5F554Ca3425b0";
const WALLET_ADDRESS = "0x2f97BB8e18B8c49C9112E0524F3Ac7cE0E7727b3";

async function monitorAndStake() {
  const provider = new ethers.JsonRpcProvider(WORLD_RPC);
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("Wallet private key not found in environment variables");
}
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(STAKING_CONTRACT, WorldFinanceABI, wallet);
  
  // Monitor wallet balance
  provider.on('block', async () => {
    try {
      const balance = await provider.getBalance(WALLET_ADDRESS);
      if (balance > 0) {
        // Stake the full balance
        await contract.stake(balance);
        console.log(`Staked ${balance} WLD from intermediary wallet`);
      }
    } catch (error) {
      console.error('Staking error:', error);
    }
  });
}

monitorAndStake().catch(console.error);
