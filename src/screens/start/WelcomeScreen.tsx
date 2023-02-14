import React, { useEffect } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';

import fullLogo from '@assets/images/fullLogo.png';
import Button, { ButtonType } from '@components/Button';
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
    >
      <Message text="access.welcome.welcomeText" image={fullLogo} svgColor={theme.colors.primary} />
      <StyledButton
        text="access.welcome.importWalletButton"
        onPress={goToImport}
        type={ButtonType.PRIMARY}
      />
      <StyledButton
        text="access.welcome.createWalletButton"
        onPress={goToCreate}
        type={ButtonType.TERTIARY}
      />
    </ScreenLayout>
  );
};

export default WelcomeScreen;