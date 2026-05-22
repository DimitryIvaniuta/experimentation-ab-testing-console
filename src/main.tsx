import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppConfigProvider } from './state/AppConfigContext';
import './styles/theme.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppConfigProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppConfigProvider>
    </BrowserRouter>
  </StrictMode>
);
