import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from '@miuprep/ui';
import { LanguageProvider } from '@miuprep/i18n/src/react';
import { portalI18n } from './i18n';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider translator={portalI18n}>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
