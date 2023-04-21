import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import appIcon from '@assets/images/icon.png';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import useStartFlowFlag from '@hooks/useStartFlowFlag';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const CheckboxSection = styled.View`
  margin-vertical: ${({ theme }) => theme.spacing(6)};
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type WelcomeScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.welcome>;

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { setComesFromStartFlow } = useStartFlowFlag();

  const [ppAccepted, setPpAccepted] = useState(false);
  const [tycAccepted, setTycAccepted] = useState(false);

  useEffect(() => {
    setComesFromStartFlow(true);
  }, []);

  const goToPp = () => Linking.openURL(t('links.pp'));
  const goToTyc = () => Linking.openURL(t('links.tyc'));
  const goToImport = () => navigation.navigate(ScreenName.obtainAccess);
  const goToCreate = () => navigation.navigate(ScreenName.startGuide);

  const disableButtons = !tycAccepted || !ppAccepted;

  return (
    <ScreenLayout
      title="access.welcome.title"
      hasBack={false}
      bigTitle
      hasFooterBanner
      gradientBackground
      scroll
    >
      <Message
        text="access.welcome.welcomeText"
        image={appIcon}
        svgColor={theme.colors.primary}
      />
      <CheckboxSection>
        <StyledCheckbox
          value={ppAccepted}
          textHasLinks
          label="access.welcome.pp"
          onPressText={goToPp}
          onChange={() => setPpAccepted(!ppAccepted)}
        />
        <StyledCheckbox
          value={tycAccepted}
          textHasLinks
          label="access.welcome.tyc"
          onPressText={goToTyc}
          onChange={() => setTycAccepted(!tycAccepted)}
        />
      </CheckboxSection>
      <StyledButton
        text="access.welcome.importWalletButton"
        onPress={goToImport}
        disabled={disableButtons}
      />
      <StyledButton
        text="access.welcome.createWalletButton"
        onPress={goToCreate}
        type="tertiary"
        disabled={disableButtons}
      />
    </ScreenLayout>
  );
};

export default WelcomeScreen;