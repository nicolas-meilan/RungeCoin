import React, { useEffect } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';

import appIcon from '@assets/images/icon.png';
import Button from '@components/Button';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import useStartFlowFlag from '@hooks/useStartFlowFlag';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

type WelcomeScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.welcome>;

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const { setComesFromStartFlow } = useStartFlowFlag();
  const theme = useTheme();

  useEffect(() => {
    setComesFromStartFlow(true);
  }, []);

  const goToImport = () => navigation.navigate(ScreenName.obtainAccess);
  const goToCreate = () => navigation.navigate(ScreenName.startGuide);

  return (
    <ScreenLayout
      title="access.welcome.title"
      hasBack={false}
      bigTitle
      hasFooterBanner
      gradientBackground
    >
      <Message text="access.welcome.welcomeText" image={appIcon} svgColor={theme.colors.primary} />
      <StyledButton
        text="access.welcome.importWalletButton"
        onPress={goToImport}
      />
      <StyledButton
        text="access.welcome.createWalletButton"
        onPress={goToCreate}
        type="tertiary"
      />
    </ScreenLayout>
  );
};

export default WelcomeScreen;