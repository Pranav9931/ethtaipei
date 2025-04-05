import styled from 'styled-components';

import {
  Routes,
  Route
} from 'react-router-dom';

import Stake from './pages/Stake';
import Loans from './pages/Loans';
import Home from './pages/Home';

const AppContainer = styled.div`
  // display: flex;
  padding: var(--global-padding-vr) var(--global-padding-hr);
`;


function App() {
  return (
    <AppContainer>
      <Routes>
        <Route path= '/' element={<Home />} />
        <Route path= '/stake' element={<Stake />} />
        <Route path= '/loans' element={<Loans />} />
      </Routes>
      
    </AppContainer>
  );
}

export default App;
