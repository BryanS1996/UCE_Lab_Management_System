import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    open: true,
    proxy: {
      // En desarrollo local, redirige /api/* al API Gateway corriendo en localhost:3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
