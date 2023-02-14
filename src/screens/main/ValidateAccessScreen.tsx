import React, { useEffect, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import styled from 'styled-components/native';

import Button from '@components/Button';
import Card from '@components/Card';
import Icon from '@components/Icon';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import useBiometrics from '@hooks/useBiometrics';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import StorageKeys from '@system/storageKeys';
import { hashFrom } from '@utils/security';

const FINGERPRINT_SIZE = 80;

const AlignWrapper = styled.View`
  flex: 1;
  justify-content: space-evenly;
  overflow: hidden;
`;

const FingerprintCard = styled(Card)`
  border-color: ${({ theme, disabled }) => (disabled
    ? theme.colors.disabled
    : theme.colors.info)};
  align-self: center;
`;

const Fingerprint = styled(Icon).attrs({
  name: 'fingerprint',
})`
  color: ${({ theme }) => theme.colors.info};
  font-size: ${FINGERPRINT_SIZE}px;
`;

type ValidateAccessScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.validateAccess>;

const ValidateAccessScreen = ({ navigation }: ValidateAccessScreenProps) => {
  const {
    biometricsEnabled,
    dispatchBiometrics,
  } = useBiometrics();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [userPassword, setUserPassword] = useState<string | null>(null);

  const goToHome = () => navigation.reset({
    index: 0,
    routes: [{ name: ScreenName.home }],
  });

  const validateWithBiometrics = async () => {
    const grantAccess = await dispatchBiometrics();

    if (grantAccess) goToHome();
  };

  useEffect(() => {
    if (biometricsEnabled) validateWithBiometrics();
  }, [biometricsEnabled]);

  useEffect(() => {
    EncryptedStorage.getItem(StorageKeys.PASSWORD)
      .then((newUserPassword) => setUserPassword(newUserPassword));
  }, []);

  const onPasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordError(false);
  };

  const onPressContinue = () => {
    const invalidPassword = userPassword !== hashFrom(password);
    setPasswordError(invalidPassword);
    if (invalidPassword) return;

    goToHome();
  };

  return (
    <ScreenLayout
      title='main.validateAccess.title'
      bigTitle
      hasBack={false}
      hasFooterBanner
    >
      <TextInput
        label="main.validateAccess.inputs.password"
        placeholder="main.validateAccess.inputs.passwordPH"
        type="password"
        value={password}
        error={passwordError}
        errorMessage="main.validateAccess.inputs.passwordError"
        onChangeText={onPasswordChange}
      />
      <AlignWrapper>
        <FingerprintCard
          touchable
          onPress={validateWithBiometrics}
          disabled={!biometricsEnabled}
        >
          <Fingerprint disabled={!biometricsEnabled} />
        </FingerprintCard>
        <Button
          disabled={passwordError || !password || !userPassword}
          text="common.continue"
          onPress={onPressContinue}
        />
      </AlignWrapper>
    </ScreenLayout>
  );
};

export default ValidateAccessScreen;
