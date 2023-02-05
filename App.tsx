import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import initializeI18nConfig from './src/locale/i18nConfig';
import Root from './src/Root';
import ThemeProvider from './src/theme/ThemeProvider';

initializeI18nConfig();
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
