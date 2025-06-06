// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths'; // For resolving path aliases via tsconfig

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // If you deploy to a custom domain root on Vercel, ensure base is '/'
  base: '/', 
  build: {
    outDir: 'dist', // Default output directory
  },
});