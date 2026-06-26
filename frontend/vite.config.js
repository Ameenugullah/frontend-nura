import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Raise the warning threshold slightly — our chunks are intentionally
    // split and this avoids noise during Railway CI builds.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:    ['react', 'react-dom', 'react-router-dom'],
          pocketbase: ['pocketbase'],
        },
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Dev-only proxy so CORS never blocks local PocketBase requests.
      '/api/pb': {
        target:       'http://127.0.0.1:8090',
        changeOrigin: true,
        rewrite:      path => path.replace(/^\/api\/pb/, ''),
      },
    },
  },
});