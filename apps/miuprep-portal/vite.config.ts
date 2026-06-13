import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const skipPublicCopy = process.env.MIUPREP_SKIP_PUBLIC_COPY === '1';

export default defineConfig({
  plugins: [react()],
  publicDir: skipPublicCopy ? false : 'public',
  build: {
    emptyOutDir: false,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');

          if (normalized.includes('/node_modules/')) {
            if (
              normalized.includes('/react/') ||
              normalized.includes('/react-dom/') ||
              normalized.includes('/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (normalized.includes('/katex/')) {
              return 'vendor-katex';
            }
            return 'vendor';
          }

          if (normalized.includes('/packages/knowledge/src/')) return 'miuprep-knowledge';
          if (normalized.includes('/packages/db/src/')) return 'miuprep-db';
          if (normalized.includes('/packages/learning/src/')) return 'miuprep-learning';
          if (normalized.includes('/packages/core/src/')) return 'miuprep-core';
          if (normalized.includes('/packages/ui/src/')) return 'miuprep-ui';

          if (normalized.includes('/apps/miuprep-portal/src/lib/studentProgress')) return 'portal-student-progress';
          if (normalized.includes('/apps/miuprep-portal/src/lib/adminContent')) return 'portal-admin-content';
          if (normalized.includes('/apps/miuprep-portal/src/lib/lessonTemplates')) return 'portal-lesson-templates';
          if (normalized.includes('/apps/miuprep-portal/src/lib/englishItemBankPractice'))
            return 'portal-english-practice';
          if (normalized.includes('/apps/miuprep-portal/src/lib/templatePractice')) return 'portal-template-practice';

          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
});
