import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:5001',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
