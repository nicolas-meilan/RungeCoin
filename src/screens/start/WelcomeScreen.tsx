import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';

import logoWithBackground from '@assets/images/logoWithBackground.svg';
import Button, { ButtonType } from '@components/Button';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

type WelcomeScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.welcome>;

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const theme = useTheme();
  const goToImport = () => navigation.navigate(ScreenName.requestSeedPhrase);
  const goToCreate = () => navigation.navigate(ScreenName.startGuide);

  return (
    <ScreenLayout
      title="access.welcome.title"
      hasBack={false}
      bigTitle
      hasFooterBanner
    >
      <Message text="access.welcome.welcomeText" svg={logoWithBackground} svgColor={theme.colors.primary} />
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