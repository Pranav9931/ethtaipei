import { Box } from '@mui/material'
import { MiniKit } from '@worldcoin/minikit-js';
import { Button } from '@mui/material';

import { Money, Cardholder, CurrencyEth, Coins } from "@phosphor-icons/react";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';
import styled from 'styled-components';
import { Logo } from '../assets';
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
`

const TransactionHistoryTab = styled.div`
  display: flex;
`

function generateNonce() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

const Home = () => {

    const navigate = useNavigate();

  const [userAddress, setUserAddress] = useState<null | string>(null);

  const [addressShort, setAddressShort] = useState<string>('0x41..46b0');

  useEffect(() => {
    if (userAddress && userAddress.length > 0) {
      const newAddress: string =
        userAddress.slice(0, 4) + '...' + userAddress.slice(-4);
      setAddressShort(newAddress);
    }
  }, [userAddress]);

  const handleConnectWallet = async () => {
    try {
      // Generate a nonce on the frontend for now
      const nonce = generateNonce();

      // Perform wallet authentication
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
        <SwiperSlide style={{height: '250px'}} className="card">Slide 1</SwiperSlide>
        <SwiperSlide style={{height: '250px'}} className="card">Slide 2</SwiperSlide>
        <SwiperSlide style={{height: '250px'}} className="card">Slide 3</SwiperSlide>
      </Swiper>

      <Box sx={{
        display: 'flex',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          background: '#e6f5f9', 
          padding: '10px',
          borderRadius: '10px',
          flex: 1
        }}>
          {/* #eefcef */}
          <span>STAKED</span>
          <span style={{
            fontSize: '32px',
            fontWeight: '800'
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
            fontWeight: '800'
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
        <h3>TRANSACTION HISTORY</h3>
      </TransactionHistoryTab>
    </>
  )
}

export default Home