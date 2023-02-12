import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

import MainNavigator from './MainNavigator';
import StartNavigator from './StartNavigator';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

const ANIMATION_TIME = 500;

// TODO better loading
const LoadingWrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  align-items: center;
  justify-content: center;
`;

const AnimatedWrapper = styled(Animated.View)`
  flex: 1;
`;

const Navigator = () => {
  const theme = useTheme();
  const {
    walletPublicValues,
    walletPublicValuesLoading,
  } = useWalletPublicValues({
    refetchOnMount: true,
  });

  const [hasLoadedOneTime, setHasLoadedOneTime] = useState(false);
  const [firstFetchFinish, setFirstFetchFinish] = useState(false);

  useEffect(() => { // Detect first fetch
    if (walletPublicValuesLoading) setHasLoadedOneTime(true);
    if (hasLoadedOneTime && !walletPublicValuesLoading) setFirstFetchFinish(true);
  }, [walletPublicValuesLoading]);

  const hasWallet = useMemo(() => !!walletPublicValues, [walletPublicValues]);

  const loading = useMemo(() => (
    !firstFetchFinish && walletPublicValuesLoading
  ), [firstFetchFinish, walletPublicValuesLoading]);

  if (loading) { // TODO better loading
    return (
      <LoadingWrapper>
        <ActivityIndicator color={theme.colors.info} size={60} />
      </LoadingWrapper>
    );
  }

  return hasWallet ? (
    <AnimatedWrapper
      key="MainNavigator"
      entering={FadeIn.duration(ANIMATION_TIME)}
      exiting={FadeOut.duration(ANIMATION_TIME)}
    >
      <MainNavigator />
    </AnimatedWrapper>

  ) : (
    <AnimatedWrapper
      key="StartNavigator"
      entering={FadeIn.duration(ANIMATION_TIME)}
      exiting={FadeOut.duration(ANIMATION_TIME)}
    >
      <StartNavigator />
    </AnimatedWrapper>
  );
};

export default Navigator;
