
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['f47cce35-0708-4194-b894-8c20e85af432-00-3rxlgbcf154n6.spock.replit.dev']
  }
})
