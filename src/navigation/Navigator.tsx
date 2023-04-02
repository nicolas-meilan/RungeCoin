import { useMemo, useRef } from 'react';

import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import { ScreenName } from './constants';
import MainNavigator, { MainNavigatorType } from './MainNavigator';
import StartNavigator from './StartNavigator';
import useLockScreen from '@hooks/useLockScreen';
import useStartFlowFlag from '@hooks/useStartFlowFlag';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

const ANIMATION_TIME = 500;

const AnimatedWrapper = styled(Animated.View)`
  flex: 1;
`;

const Wrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Navigator = () => {
  const navigatorRef = useRef<NavigationContainerRef<MainNavigatorType>>(null);
  const { comesFromStartFlow } = useStartFlowFlag();
  const { walletPublicValues } = useWalletPublicValues();

  const mainNavigatorInitialScreen = useMemo(() => (comesFromStartFlow
    ? ScreenName.home
    : ScreenName.validateAccess
  ), [comesFromStartFlow]);

  const hasWallet = useMemo(() => !!walletPublicValues?.address, [walletPublicValues]);

  useLockScreen(navigatorRef, hasWallet);

  return (
    <Wrapper>
      <NavigationContainer ref={navigatorRef}>
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
    </Wrapper>
  );
};

export default Navigator;
