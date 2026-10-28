import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store.js';
import { queryClient } from './app/queryClient.js';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/tailwind.css';
import './styles/base.css';
import './styles/polish.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><Provider store={store}><QueryClientProvider client={queryClient}><App /></QueryClientProvider></Provider></React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}), { once: true });
}
