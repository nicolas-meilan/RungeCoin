import React, { useEffect, useState } from 'react';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import styled from 'styled-components/native';

import Button from '@components/Button';
import Card from '@components/Card';
import Icon from '@components/Icon';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import useBiometrics from '@hooks/useBiometrics';
import useDestroyWallet from '@hooks/useDestroyWallet';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import StorageKeys from '@system/storageKeys';
import { hashFrom } from '@utils/security';

const FINGERPRINT_SIZE = 80;
const MAX_PASSWORD_ATTEMPS = 5;

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
  const destroyWallet = useDestroyWallet();

  const {
    getItem: getStoredPasswordAttemps,
    setItem: storagePasswordAttemps,
  } = useAsyncStorage(StorageKeys.PASSWORD_ATTEMPS);

  const {
    biometricsEnabled,
    dispatchBiometrics,
  } = useBiometrics();

  const [transitionEnd, setTransitionEnd] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordAttemps, setPasswordAttemps] = useState(0);
  const [passwordError, setPasswordError] = useState(false);
  const [userPassword, setUserPassword] = useState<string | null>(null);

  const goToHome = () => {
    setPasswordAttemps(0);
    storagePasswordAttemps('0');
    navigation.reset({
      index: 0,
      routes: [{ name: ScreenName.home }],
    });
  };

  const validateWithBiometrics = async () => {
    const grantAccess = await dispatchBiometrics();

    if (grantAccess) goToHome();
  };

  useEffect(() => {
    getStoredPasswordAttemps().then((newPasswordAttemps) => (
      setPasswordAttemps(parseInt(newPasswordAttemps || '0', 10))
    ));
    EncryptedStorage.getItem(StorageKeys.PASSWORD)
      .then((newUserPassword) => setUserPassword(newUserPassword));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => setTransitionEnd(true));
  
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (passwordAttemps >= MAX_PASSWORD_ATTEMPS) destroyWallet();
  }, [passwordAttemps]);
  
  useEffect(() => {
    if (biometricsEnabled && transitionEnd) validateWithBiometrics();
  }, [biometricsEnabled, transitionEnd]);

  const onPasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordError(false);
  };

  const onPressContinue = async () => {
    const hashedPassword = await hashFrom(password);
    const invalidPassword = userPassword !== hashedPassword;
    if (invalidPassword) {
      const newPasswordAttemps = passwordAttemps + 1;
      await storagePasswordAttemps(newPasswordAttemps.toString());
      setPasswordAttemps(newPasswordAttemps);
      setPasswordError(true);

      return;
    }

    goToHome();
  };

  const remainingAttemps = MAX_PASSWORD_ATTEMPS - passwordAttemps;

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
        errorMessage={remainingAttemps
          ? 'main.validateAccess.inputs.passwordError'
          : ''}
        errorI18nArgs={{ remainingAttemps }}
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
