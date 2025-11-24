import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Exposes the server to the cloud environment
    allowedHosts: true, // Allows the dynamic Codespaces URL
    hmr: {
      clientPort: 443 // Fixes the "WebSocket connection failed" error in Codespaces
    }
  }
})