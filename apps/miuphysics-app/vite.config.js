import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');

          if (normalized.includes('/node_modules/')) {
            if (normalized.includes('/react/') || normalized.includes('/react-dom/') || normalized.includes('/scheduler/')) {
              return 'vendor-react';
            }
            if (normalized.includes('/katex/')) {
              return 'vendor-katex';
            }
            if (normalized.includes('/dompurify/')) {
              return 'vendor-sanitize';
            }
            return 'vendor';
          }

          if (normalized.includes('/packages/content/src/')) return 'miuprep-content';
          if (normalized.includes('/packages/knowledge/src/')) return 'miuprep-knowledge';
          if (normalized.includes('/packages/learning/src/')) return 'miuprep-learning';

          return undefined;
        },
      },
    },
  },
  server: {
    port: 5189,
    strictPort: true,
  }
})
