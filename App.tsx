import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import initializeI18nConfig from './src/locale/i18nConfig';
import ThemeProvider from './src/theme/ThemeProvider';
import Navigator from '@navigation/Navigator';

initializeI18nConfig();

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initializeI18nConfig().then(() => setAppReady(true));
  }, []);

  if (!appReady) return <></>; // TODO

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
