import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group heavy UI library
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Group Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Standard vendor chunk for others
            return 'vendor';
          }
        },
      },
    },
  },
})

