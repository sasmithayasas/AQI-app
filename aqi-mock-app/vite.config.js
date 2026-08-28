import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          capacitor: [
            '@capacitor/core',
            '@capacitor/app',
            '@capacitor/local-notifications',
            '@capacitor/filesystem',
            '@capacitor/share',
          ],
        },
      },
    },
  },
})
