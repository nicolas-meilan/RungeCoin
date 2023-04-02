import React, { useEffect, useState } from 'react';

import { DEV_WALLET_SEED_PHRASE } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import Switch from '@components/Switch';
import TextInput from '@components/TextInput';
import useBiometrics from '@hooks/useBiometrics';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';
import StorageKeys from '@system/storageKeys';
import { isDev } from '@utils/config';
import { PASSWORD_REGEX } from '@utils/formatter';
import { hashFrom } from '@utils/security';
import { delay } from '@utils/time';
import {
  SEED_PHRASE_VALID_LENGTH,
  formatSeedPhrase,
  isValidSeedPhrase,
  createWalletFromSeedPhrase,
} from '@web3/wallet';

const PasswordInput = styled(TextInput)`
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const Form = styled.View`
  height: 350px;
`;

const BASE_PASS_ERR = 'common.inputs.passwordError';
const BASE_SEED_ERR = 'access.obtainAccess.inputs.seedPhraseError';

const baseSeedPhrase = isDev() ? DEV_WALLET_SEED_PHRASE : '';

const HwButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

type ObtainAccessScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.obtainAccess>;

const ObtainAccessScreen = ({ navigation, route }: ObtainAccessScreenProps) => {
  const comesFromSeedPhraseCreation = route.params?.comesFromSeedPhraseCreation;

  const [loading, setLoading] = useState(false);

  const {
    walletPublicValues,
    setWalletPublicValues,
  } = useWalletPublicValues();

  const {
    setBiometrics,
    biometricsEnabled,
    deviceHasBiometrics,
  } = useBiometrics({
    onBiometricsChangeCancel: () => setLoading(false),
  });

  const [seedPhrase, setSeedPhrase] = useState(baseSeedPhrase);
  const [password, setPassword] = useState('');

  const [seedPhraseError, setSeedPhraseError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [seedPhraseShowError, setSeedPhraseShowError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);

  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);
  const [seedPhraseErrorMessage, setSeedPhraseErrorMessage] = useState(BASE_SEED_ERR);

  const [seedPhraseHidden, setSeedPhraseHidden] = useState(true);

  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [enableBiometricsAuth, setEnableBiometricsAuth] = useState(false);

  const obtainAccess = async () => {
    const wallet = await createWalletFromSeedPhrase(seedPhrase);

    await Promise.all([
      EncryptedStorage.setItem(StorageKeys.WALLET_PRIVATE_KEY, wallet.getPrivateKeyString()),
      EncryptedStorage.setItem(StorageKeys.PASSWORD, await hashFrom(password)),
    ]);

    setWalletPublicValues(wallet.getAddressString());
  };

  useEffect(() => {
    deviceHasBiometrics().then((hasBiometrics) => setCanUseBiometrics(hasBiometrics));
  }, []);

  useEffect(() => {
    if (walletPublicValues) setLoading(false);
  }, [walletPublicValues]);

  useEffect(() => {
    const canAccess = enableBiometricsAuth
    && biometricsEnabled
    && password
    && seedPhrase;
    if (canAccess) obtainAccess();
  }, [biometricsEnabled]);

  const checkSeedPhrase = (seedPhraseToCheck: string = seedPhrase) => {
    if (!seedPhraseToCheck) {
      setSeedPhraseError(false);

      return true;
    }

    const seedArray = formatSeedPhrase(seedPhraseToCheck.toLowerCase()).split(' ').map((word) => word.trim());
    const formattedSeedPhrase = seedArray.join(' ');

    const invalidSeedLength = !SEED_PHRASE_VALID_LENGTH.includes(seedArray.length);
    let someError = false;
    if (invalidSeedLength) {
      setSeedPhraseErrorMessage('access.obtainAccess.inputs.seedPhraseErrorLength');
      setSeedPhraseError(true);
      someError = true;
    }

    if (!invalidSeedLength && !isValidSeedPhrase(formattedSeedPhrase)) {
      setSeedPhraseErrorMessage(BASE_SEED_ERR);
      setSeedPhraseError(true);
      someError = true;
    }

    setSeedPhraseError(someError);
    return !someError;
  };

  const checkPassword = (passwordToCheck: string = password) => {
    if (passwordToCheck && !PASSWORD_REGEX.test(passwordToCheck)) {
      setPasswordErrorMessage(BASE_PASS_ERR);
      setPasswordError(true);
      return false;
    }

    setPasswordError(false);
    return true;
  };

  const onSeedChange = (newValue: string) => {
    setSeedPhrase(newValue.toLowerCase());
    checkSeedPhrase(newValue.toLowerCase());
  };
  const onPasswordChange = (newValue: string) => {
    setPassword(newValue);
    checkPassword(newValue);
  };

  const onSeedPhraseFocus = () => setSeedPhraseShowError(false);
  const onSeedPhraseBlur = () => setSeedPhraseShowError(true);

  const onPasswordFocus = () => setPasswordShowError(false);
  const onPasswordBlur = () => setPasswordShowError(true);

  const onPressToggleVisibilitySeedPhrase = () => setSeedPhraseHidden(!seedPhraseHidden);

  const toggleBiometricsSwitch = () => setEnableBiometricsAuth(!enableBiometricsAuth);

  const goToHw = () => navigation.navigate(ScreenName.passwordForHwConnection);

  const onPressContinue = async () => {
    const errors = !seedPhrase || seedPhraseError || !password || passwordError;
    if (errors) {
      setPasswordShowError(passwordError);
      setSeedPhraseShowError(seedPhraseError);

      return;
    }

    setLoading(true);
    if (enableBiometricsAuth) {
      await delay(0.0001); // react-native-keychain freeze the app when use biometrics
      setBiometrics(true);

      return;
    }

    obtainAccess();
  };

  const disabledByPassword = !password || (passwordError && passwordShowError);
  const disabledBySeedPhrase = !seedPhrase || (seedPhraseError && seedPhraseShowError);

  return (
    <ScreenLayout
      title="access.obtainAccess.title"
      bigTitle
      hasFooterBanner
      scroll
    >
      <Form>
        <TextInput
          label="access.obtainAccess.inputs.seedPhrase"
          placeholder="access.obtainAccess.inputs.seedPhrasePH"
          type="password"
          autoCorrect={false}
          multiline={!seedPhraseHidden}
          value={seedPhrase}
          onChangeText={onSeedChange}
          onFocus={onSeedPhraseFocus}
          onBlur={onSeedPhraseBlur}
          onPressIcon={onPressToggleVisibilitySeedPhrase}
          error={seedPhraseShowError && seedPhraseError}
          errorMessage={seedPhraseErrorMessage}
        />
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
        text="access.obtainAccess.continueButton"
        disabled={disabledByPassword || disabledBySeedPhrase}
        onPress={onPressContinue}
        loading={loading}
      />
      {!comesFromSeedPhraseCreation && (
        <HwButton
          text="access.connectHw.title"
          type="tertiary"
          onPress={goToHw}
        />
      )}
    </ScreenLayout>
  );
};

export default ObtainAccessScreen;
