import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      allow: [
        resolve(__dirname, '.'),
        resolve(__dirname, '../../accounts')
      ]
    }
  },
  build: {
    outDir: resolve(__dirname, '../static/portal'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, './src/main.jsx'),
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/index.[ext]',
      }
    }
  }
})
