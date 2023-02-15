import { useMemo } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import { ScreenName } from './constants';
import MainNavigator from './MainNavigator';
import StartNavigator from './StartNavigator';
import useStartFlowFlag from '@hooks/useStartFlowFlag';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

const ANIMATION_TIME = 500;

const AnimatedWrapper = styled(Animated.View)`
  flex: 1;
`;

const Navigator = () => {
  const { comesFromStartFlow } = useStartFlowFlag();
  const { walletPublicValues } = useWalletPublicValues();

  const mainNavigatorInitialScreen = useMemo(() => (comesFromStartFlow
    ? ScreenName.home
    : ScreenName.validateAccess
  ), [comesFromStartFlow]);

  const hasWallet = useMemo(() => !!walletPublicValues, [walletPublicValues]);

  return (
    <NavigationContainer>
      {hasWallet ? (
        <AnimatedWrapper
          key="MainNavigator"
          entering={FadeIn.duration(ANIMATION_TIME)}
          exiting={FadeOut.duration(ANIMATION_TIME)}
        >
          <MainNavigator initialScreen={mainNavigatorInitialScreen} />
        </AnimatedWrapper>

      ) : (
        <AnimatedWrapper
          key="StartNavigator"
          entering={FadeIn.duration(ANIMATION_TIME)}
          exiting={FadeOut.duration(ANIMATION_TIME)}
        >
          <StartNavigator />
        </AnimatedWrapper>
      )}
    </NavigationContainer>
  );
};

export default Navigator;
