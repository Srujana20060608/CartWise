import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// In dev the browser talks to Vite (5173); anything under /api is forwarded to the Express server (3001).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: false } } },
})
