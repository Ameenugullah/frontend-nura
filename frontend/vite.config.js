import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:     ['react', 'react-dom', 'react-router-dom'],
          pocketbase: ['pocketbase'],
        },
      },
    },
  },

  server: {
    port: 5173,
    // Dev-only proxy so CORS never blocks local PocketBase requests.
    proxy: {
      '/api/pb': {
        target:       'http://127.0.0.1:8090',
        changeOrigin: true,
        rewrite:      path => path.replace(/^\/api\/pb/, ''),
      },
    },
  },

  preview: {
    port: 4173,
  },
});
