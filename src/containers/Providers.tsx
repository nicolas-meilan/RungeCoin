import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import Notification from './Notification';
import ThemeProvider from '../theme/ThemeProvider';

const queryClient = new QueryClient();

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`
  flex: 1;
`;

const notificationContainerInstance = <Notification />;

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SafeAreaProvider>
        <StyledGestureHandlerRootView>
          {children}
          {notificationContainerInstance}
        </StyledGestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default Providers;
