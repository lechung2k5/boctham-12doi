import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      },
      '/api': {
        target: 'http://localhost:3001'
      },
      '/logos': {
        target: 'http://localhost:3001'
      },
      '/assets/khung-boc-tham': {
        target: 'http://localhost:3001'
      },
      '/assets/khung-tong': {
        target: 'http://localhost:3001'
      }
    }
  }
});

