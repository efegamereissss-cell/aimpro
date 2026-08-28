import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // 1. Disable Source Maps (Prevents original TSX/TS files from ever being exposed)
    sourcemap: false,
    // 2. High-Performance Minification & Code Mangling
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        // Obfuscated randomized hash chunks
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    }
  },
  esbuild: {
    // Drop debuggers and unnecessary logs in production
    drop: ['debugger'],
    legalComments: 'none'
  }
});
