import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          pb: ['pocketbase'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/pb': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/pb/, ''),
      },
    },
  },
});
