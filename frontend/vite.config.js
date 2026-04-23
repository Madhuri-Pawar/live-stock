import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy REST health check — keep WS direct to avoid proxy WebSocket quirks
      '/health': 'http://localhost:3001',
    },
  },
});
