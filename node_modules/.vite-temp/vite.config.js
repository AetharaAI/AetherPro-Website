// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // For resolving path aliases

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Maps '@/' to your 'src/' directory
    },
  },
  // If you deploy to a custom domain root on Vercel, ensure base is '/'
  base: '/', 
  build: {
    outDir: 'dist', // Default output directory
  },
});