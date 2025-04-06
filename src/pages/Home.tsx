import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { MiniKit } from '@worldcoin/minikit-js';

import { Money, Cardholder, CurrencyEth, Coins } from "@phosphor-icons/react";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';

import styled from 'styled-components';
import { Logo, SliderImage } from '../assets';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LogoImage = styled.img`
  height: 30px;
`;

const WidgetWrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const WidgetCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  background: #00000010;
  color: #000000;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  font-size: 10px;
  font-family: var(--main-font);
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #00000020;
  }
`

const TransactionHistoryTab = styled.div`
  display: flex;
  margin-top: 30px;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 16px;
  font-family: var(--main-font);
`

function generateNonce() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const transactionTypes = ['STAKE', 'BORROW', 'REPAYMENT', 'REWARD'];
const statuses = ['Success', 'Pending', 'Failed'];

const generateDummyTransactions = () => {
  return Array.from({ length: 25 }).map(() => {
    const txHash = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date(Date.now() - Math.floor(Math.random() * 1e10)).toLocaleDateString();
    return {
      hash: txHash,
      type,
      status,
      date,
    };
  });
};

const Home = () => {
  const navigate = useNavigate();

  const [userAddress, setUserAddress] = useState<null | string>(null);
  const [addressShort, setAddressShort] = useState<string>('0x41..46b0');
  const transactions = generateDummyTransactions();

  useEffect(() => {
    if (userAddress && userAddress.length > 0) {
      const newAddress: string =
        userAddress.slice(0, 4) + '...' + userAddress.slice(-4);
      setAddressShort(newAddress);
    }
  }, [userAddress]);

  const handleConnectWallet = async () => {
    try {
      const nonce = generateNonce();
      const data = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: 'Sign in to access the app',
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      if (data.finalPayload.status === 'success') {
        setUserAddress(data.finalPayload.address);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <LogoImage src={Logo} alt="App Logo" />
        {userAddress ? (
          <Box
            sx={{
              padding: '10px 20px',
              background: 'black',
              color: 'white',
              borderRadius: '10px',
              textTransform: 'uppercase',
              fontFamily: 'var(--main-font)',
            }}
          >
            {addressShort}
          </Box>
        ) : (
          <Button
            onClick={handleConnectWallet}
            sx={{ color: '#000000', fontFamily: 'var(--main-font)' }}
          >
            Connect
          </Button>
        )}
      </Box>

      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper"
        style={{
          margin: '20px 0'
        }}
      >
        <SwiperSlide style={{ height: '250px' }} className="card">
          <img src={SliderImage} />
        </SwiperSlide>
        <SwiperSlide style={{ height: '250px' }} className="card">
          <img src={SliderImage} />
        </SwiperSlide>
        <SwiperSlide style={{ height: '250px' }} className="card">
          <img src={SliderImage} />
        </SwiperSlide>
      </Swiper>

      <Box sx={{
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        fontFamily: 'var(--main-font)'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          background: '#e6f5f9',
          padding: '10px',
          borderRadius: '10px',
          flex: 1
        }}>
          <span>STAKED</span>
          <span style={{
            fontSize: '32px',
            fontWeight: '800',
            fontFamily: 'var(--main-font)'
          }}>ETH 1</span>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          background: '#eefcef',
          padding: '10px',
          borderRadius: '10px',
          flex: 1
        }}>
          <span>LOANED</span>
          <span style={{
            fontSize: '32px',
            fontWeight: '800',
            fontFamily: 'var(--main-font)'
          }}>ETH 20</span>
        </Box>
      </Box>

      <WidgetWrapper>
        <WidgetCard onClick={() => navigate('/stake')}>
          <CurrencyEth size={24} />
          STAKE
        </WidgetCard>

        <WidgetCard onClick={() => navigate('/loans')}>
          <Money size={24} />
          LOANS
        </WidgetCard>

        <WidgetCard onClick={() => navigate('/cards')}>
          <Cardholder size={24} />
          CARDS
        </WidgetCard>

        <WidgetCard onClick={() => navigate('/rewards')}>
          <Coins size={24} />
          REWARDS
        </WidgetCard>
      </WidgetWrapper>

      <TransactionHistoryTab>
        TRANSACTION HISTORY
      </TransactionHistoryTab>

      <Paper sx={{ width: '100%', overflowX: 'auto' }}>
        <Table sx={{ fontFamily: 'var(--main-font)' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: 'var(--main-font)' }}>Tx Hash</TableCell>
              <TableCell sx={{ fontFamily: 'var(--main-font)' }}>Type</TableCell>
              <TableCell sx={{ fontFamily: 'var(--main-font)' }}>Status</TableCell>
              <TableCell sx={{ fontFamily: 'var(--main-font)' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ fontFamily: 'var(--main-font)' }}>
                  {tx.hash.slice(0, 6) + '...' + tx.hash.slice(-4)}
                </TableCell>
                <TableCell sx={{ fontFamily: 'var(--main-font)' }}>{tx.type}</TableCell>
                <TableCell sx={{ fontFamily: 'var(--main-font)' }}>{tx.status}</TableCell>
                <TableCell sx={{ fontFamily: 'var(--main-font)' }}>{tx.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default Home;
