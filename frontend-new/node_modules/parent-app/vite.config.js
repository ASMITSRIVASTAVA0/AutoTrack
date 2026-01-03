import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  base: './',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  },
  css: {
    postcss: './postcss.config.js',
  },
})