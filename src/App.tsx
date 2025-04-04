import styled from 'styled-components'
import './App.css'
import { MiniKit } from '@worldcoin/minikit-js'
import { Logo } from './assets'
import { Box } from '@mui/system'
import { Button } from '@mui/material'

const AppContainer = styled.div`
  display: flex;
  padding: var(--global-padding-vr) var(--global-padding-hr);
`

const LogoImage = styled.img`
  height: 30px;
`

function App() {
  console.log("APP:", MiniKit.isInstalled())

  return (
    <AppContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <LogoImage src={Logo} />
        <Button sx={{color: '#000000'}}>CONNECT</Button>
      </Box>
    </AppContainer>
  )
}

export default App
