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
import useDestroyWallet from '@hooks/useDestroyWallet';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import StorageKeys from '@system/storageKeys';
import { comparePassword } from '@utils/security';

const FINGERPRINT_SIZE = 40;
const MAX_PASSWORD_ATTEMPS = 5;

const FingerprintCard = styled(Card)`
  border-color: ${({ theme, disabled }) => (disabled
    ? theme.colors.disabled
    : theme.colors.info)};
  align-self: center;
`;

const ContinueButton = styled(Button)`
  margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(10)} 0;
`;

const Fingerprint = styled(Icon)`
  color: ${({ theme }) => theme.colors.info};
  font-size: ${FINGERPRINT_SIZE}px;
`;

type ValidateAccessScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.validateAccess>;

const ValidateAccessScreen = ({ navigation, route }: ValidateAccessScreenProps) => {
  const destroyWallet = useDestroyWallet();

  const {
    biometricsEnabled,
    dispatchBiometrics,
  } = useBiometrics();

  const [transitionEnd, setTransitionEnd] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordAttemps, setPasswordAttemps] = useState(0);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  const comesFromBackground = route.params?.comesFromBackground;

  const goToNextScreen = () => {
    setPasswordAttemps(0);
    EncryptedStorage.setItem(StorageKeys.PASSWORD_ATTEMPS, '0');
    if (comesFromBackground) {
      navigation.goBack();
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: ScreenName.home }],
    });
  };

  const validateWithBiometrics = async () => {
    const grantAccess = await dispatchBiometrics();

    if (grantAccess) goToNextScreen();
  };

  useEffect(() => {
    EncryptedStorage.getItem(StorageKeys.PASSWORD_ATTEMPS)
      .then((newPasswordAttemps) => (
        setPasswordAttemps(parseInt(newPasswordAttemps || '0', 10))
      ));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => setTransitionEnd(true));

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (biometricsEnabled && transitionEnd) validateWithBiometrics();
  }, [biometricsEnabled, transitionEnd]);

  const remainingAttemps = MAX_PASSWORD_ATTEMPS - passwordAttemps;

  useEffect(() => {
    if (remainingAttemps <= 0) destroyWallet();
  }, [remainingAttemps]);

  const onPasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordError(false);
  };

  const disableContunue = passwordError || !password;
  const onPressContinue = async () => {
    if (disableContunue) return;

    setLoading(true);
    const isValidPassword = await comparePassword(password);
    if (!isValidPassword) {
      const newPasswordAttemps = passwordAttemps + 1;
      await EncryptedStorage.setItem(StorageKeys.PASSWORD_ATTEMPS, newPasswordAttemps.toString());
      setPasswordAttemps(newPasswordAttemps);
      setPasswordError(true);
      setLoading(false);

      return;
    }

    setLoading(false);
    goToNextScreen();
  };

  return (
    <ScreenLayout
      title="main.validateAccess.title"
      bigTitle
      hasBack={false}
      scroll
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
        onSubmitEditing={onPressContinue}
      />
      <ContinueButton
        disabled={disableContunue}
        loading={loading}
        text="common.continue"
        onPress={onPressContinue}
      />
      <FingerprintCard
        touchable
        onPress={validateWithBiometrics}
        disabled={!biometricsEnabled}
      >
        <Fingerprint
          name="fingerprint"
          disabled={!biometricsEnabled}
        />
      </FingerprintCard>
    </ScreenLayout>
  );
};

export default ValidateAccessScreen;
