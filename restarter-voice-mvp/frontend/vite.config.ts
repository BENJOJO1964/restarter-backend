import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // 允許外部訪問
    proxy: {
      '/api': {
        target: 'https://restarter-backend-6e9s.onrender.com',
        changeOrigin: true,
      },
    },
  },
}); 