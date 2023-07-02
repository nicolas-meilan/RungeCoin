import React, { useEffect, useState } from 'react';

import SplashScreen from 'react-native-splash-screen';

import initializeI18nConfig from './locale/i18nConfig';
import useBlockchainData from '@hooks/useBlockchainData';
import useConsolidatedCurrency from '@hooks/useConsolidatedCurrency';
import useThemeConfiguration from '@hooks/useThemeConfiguration';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import Navigator from '@navigation/Navigator';

const Root = () => {
  const { themeMode, initializeTheme } = useThemeConfiguration();
  const { walletPublicValuesLoading } = useWalletPublicValues({
    refetchOnMount: true,
  });
  const {
    blockchainLoading,
    isBlockchainInitialLoading,
  } = useBlockchainData({
    refetchOnMount: true,
  });
  const {
    consolidatedCurrency,
  } = useConsolidatedCurrency({
    refetchOnMount: true,
  });

  const [appReady, setAppReady] = useState(false);
  const [i18nLoading, setI18nLoading] = useState(true);
  const [finishFetchBlockchain, setFinishFetchBlockchain] = useState(false);

  useEffect(() => {
    if (!isBlockchainInitialLoading && !blockchainLoading) {
      setFinishFetchBlockchain(true);
    }
  }, [isBlockchainInitialLoading, blockchainLoading]);

  useEffect(() => {
    initializeTheme();
    initializeI18nConfig().then(() => setI18nLoading(false));
  }, []);

  useEffect(() => {
    if (appReady) return;

    const canStart =
      !!themeMode
      && !!consolidatedCurrency
      && !i18nLoading
      && !walletPublicValuesLoading
      && finishFetchBlockchain;

    setAppReady(canStart);
  }, [
    i18nLoading,
    themeMode,
    walletPublicValuesLoading,
    finishFetchBlockchain,
    consolidatedCurrency,
  ]);

  useEffect(() => {
    if (appReady) SplashScreen.hide();
  }, [appReady]);

  if (!appReady) return <></>;

  return <Navigator />;
};

export default Root;