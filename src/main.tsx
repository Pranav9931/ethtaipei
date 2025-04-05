import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import MiniKitProvider from './MiniKit.tsx'

createRoot(document.getElementById('root')!).render(
  <MiniKitProvider>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</MiniKitProvider>,
)
