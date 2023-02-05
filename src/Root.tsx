import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import initializeI18nConfig from './locale/i18nConfig';
import useTheme from '@hooks/useTheme';
import Navigator from '@navigation/Navigator';

const Root = () => {
  const { themeMode, initializeTheme } = useTheme();
  const [appReady, setAppReady] = useState(false);
  const [i18nLoading, setI18nLoading] = useState(true);

  useEffect(() => {
    initializeTheme();
    initializeI18nConfig().then(() => setI18nLoading(false));
  }, []);

  useEffect(() => {
    const canStart = !!themeMode && !i18nLoading;

    setAppReady(canStart);
  }, [i18nLoading, themeMode]);

  if (!appReady) return <></>; // TODO

  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
};

export default Root;