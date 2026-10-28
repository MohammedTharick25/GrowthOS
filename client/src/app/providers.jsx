import { Provider } from 'react-redux';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersister, queryClient } from './queryClient.js';
import { store } from './store.js';

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 24 * 60 * 60 * 1000,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => query.state.status === 'success' && query.meta?.persist !== false,
          },
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </Provider>
  );
}
