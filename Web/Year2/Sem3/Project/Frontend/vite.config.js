import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy requests to Express backend running on 8080
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/message': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/group': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
});
