import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ThemeProvider from '../theme/ThemeProvider';

const queryClient = new QueryClient();

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`
  flex: 1;
`;

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SafeAreaProvider>
        <StyledGestureHandlerRootView>
          {children}
        </StyledGestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default Providers;
