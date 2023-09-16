import React, { useEffect, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import Switch from '@components/Switch';
import TextInput from '@components/TextInput';
import useBiometrics from '@hooks/useBiometrics';
import useDestroyWallet from '@hooks/useDestroyWallet';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';
import { PASSWORD_REGEX } from '@utils/formatter';
import { storePassword } from '@utils/security';
import { delay } from '@utils/time';

const PasswordInput = styled(TextInput)`
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const Form = styled.View`
  height: 350px;
`;

const BASE_PASS_ERR = 'common.inputs.passwordError';


type PasswordForHwConnectionScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.passwordForHwConnection>;

const PasswordForHwConnectionScreen = ({ navigation }: PasswordForHwConnectionScreenProps) => {
  const [loading, setLoading] = useState(false);

  const destroyWallet = useDestroyWallet();

  const {
    setBiometrics,
    biometricsEnabled,
    deviceHasBiometrics,
  } = useBiometrics({
    onBiometricsChangeCancel: () => setLoading(false),
  });

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);

  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [enableBiometricsAuth, setEnableBiometricsAuth] = useState(false);

  const onDataSetted = async () => {
    await storePassword(password);
    navigation.navigate(ScreenName.connectWithHw);
  };

  useEffect(() => {
    destroyWallet();
    deviceHasBiometrics().then((hasBiometrics) => setCanUseBiometrics(hasBiometrics));
  }, []);

  useEffect(() => {
    const canAccess = enableBiometricsAuth && biometricsEnabled && password;
    if (canAccess) onDataSetted();
  }, [biometricsEnabled]);

  const checkPassword = (passwordToCheck: string = password) => {
    if (passwordToCheck && !PASSWORD_REGEX.test(passwordToCheck)) {
      setPasswordErrorMessage(BASE_PASS_ERR);
      setPasswordError(true);
      return false;
    }

    setPasswordError(false);
    return true;
  };

  const onPasswordChange = (newValue: string) => {
    setPassword(newValue);
    checkPassword(newValue);
  };

  const onPasswordFocus = () => setPasswordShowError(false);
  const onPasswordBlur = () => setPasswordShowError(true);

  const toggleBiometricsSwitch = () => setEnableBiometricsAuth(!enableBiometricsAuth);

  const onPressContinue = async () => {
    const errors = !password || passwordError;
    if (errors) {
      setPasswordShowError(passwordError);

      return;
    }

    setLoading(true);
    if (enableBiometricsAuth) {
      await delay(0.0001); // react-native-keychain freeze the app when use biometrics
      setBiometrics(true);

      return;
    }

    onDataSetted();
  };

  const disabledByPassword = !password || (passwordError && passwordShowError);

  return (
    <ScreenLayout
      title="access.hwPassword.title"
      bigTitle
      hasFooterBanner
      scroll
    >
      <Form>
        <PasswordInput
          label="common.inputs.password"
          placeholder="common.inputs.passwordPH"
          type="password"
          value={password}
          onChangeText={onPasswordChange}
          onFocus={onPasswordFocus}
          onBlur={onPasswordBlur}
          error={passwordShowError && passwordError}
          errorMessage={passwordErrorMessage}
        />
        <Switch
          label="access.biometrics.useBiometrics"
          value={enableBiometricsAuth}
          disabled={!canUseBiometrics}
          onChange={toggleBiometricsSwitch}
        />
      </Form>
      <Button
        text="access.connectHw.title"
        disabled={disabledByPassword}
        onPress={onPressContinue}
        loading={loading}
      />
    </ScreenLayout>
  );
};

export default PasswordForHwConnectionScreen;
