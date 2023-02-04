import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import initializeI18nConfig from './src/locale/i18nConfig';
import Navigator from '@navigation/Navigator';

initializeI18nConfig();

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initializeI18nConfig().then(() => setAppReady(true));
  }, []);

  if (!appReady) return <></>; // TODO

  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
};

export default App;
