import React, { useEffect, useState } from 'react';

import initializeI18nConfig from './locale/i18nConfig';
import Notification from '@containers/Notification';
import useThemeConfiguration from '@hooks/useThemeConfiguration';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import Navigator from '@navigation/Navigator';

const Root = () => {
  const { themeMode, initializeTheme } = useThemeConfiguration();
  const { walletPublicValuesLoading } = useWalletPublicValues({
    refetchOnMount: true,
  });

  const [appReady, setAppReady] = useState(false);
  const [i18nLoading, setI18nLoading] = useState(true);

  useEffect(() => {
    initializeTheme();
    initializeI18nConfig().then(() => setI18nLoading(false));
  }, []);

  useEffect(() => {
    if (appReady) return;

    const canStart = !!themeMode && !i18nLoading && !walletPublicValuesLoading;
    setAppReady(canStart);
  }, [i18nLoading, themeMode, walletPublicValuesLoading]);

  if (!appReady) return <></>; // TODO better loading

  return (
    <>
      <Navigator />
      <Notification />
    </>
  );
};

export default Root;