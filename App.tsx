import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import initializeI18nConfig from './src/locale/i18nConfig';
import Root from './src/Root';
import ThemeProvider from './src/theme/ThemeProvider';

initializeI18nConfig();
const queryClient = new QueryClient();

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`
  flex: 1;
`;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SafeAreaProvider>
        <StyledGestureHandlerRootView>
          <Root />
        </StyledGestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
