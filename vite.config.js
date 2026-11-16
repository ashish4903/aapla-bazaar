import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Served from https://<user>.github.io/aapla-bazaar/
  base: '/aapla-bazaar/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
