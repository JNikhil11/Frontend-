import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,      // data stays fresh for 5 min — no loading spinner on re-open
      gcTime: 30 * 60 * 1000,         // keep in memory 30 min
    },
  },
});

// Persist query cache to localStorage so the dashboard loads instantly on every visit
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'isro-query-cache',
  throttleTime: 1000,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 30 * 60 * 1000 }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
