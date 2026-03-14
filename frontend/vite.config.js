import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion')) return 'vendor-framer';
              if (id.includes('react-icons')) return 'vendor-icons';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('axios')) return 'vendor-axios';
              if (id.includes('i18next')) return 'vendor-i18n';
              if (id.includes('sonner')) return 'vendor-ui';
              if (id.includes('react-router')) return 'vendor-router';
              return 'vendor-react'; // react, react-dom
            }
          }
      },
    },
  },
})

