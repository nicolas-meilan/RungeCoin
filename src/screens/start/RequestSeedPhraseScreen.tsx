import React, { useEffect, useState } from 'react';

import { DEV_WALLET_SEED_PHRASE } from '@env';
import EncryptedStorage from 'react-native-encrypted-storage';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import Switch from '@components/Switch';
import TextInput from '@components/TextInput';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import StorageKeys from '@system/storageKeys';
import { isDev } from '@utils/config';
import { PASSWORD_REGEX } from '@utils/constants';
import { deviceHasBiometrics, hashFrom, toggleBiometrics } from '@utils/security';
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

const BASE_PASS_ERR = 'access.requestSeedPhrase.inputs.passwordError';
const BASE_SEED_ERR = 'access.requestSeedPhrase.inputs.seedPhraseError';

const baseSeedPhrase = isDev() ? DEV_WALLET_SEED_PHRASE : '';

const RequestSeedPhraseScreen = () => {
  const {
    walletPublicValues,
    setWalletPublicValues,
  } = useWalletPublicValues();

  const [seedPhrase, setSeedPhrase] = useState(baseSeedPhrase);
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [isEncryptedStorageFinished, setIsEncryptedStorageFinished] = useState(false);

  const [seedPhraseError, setSeedPhraseError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [seedPhraseShowError, setSeedPhraseShowError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);

  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);
  const [seedPhraseErrorMessage, setSeedPhraseErrorMessage] = useState(BASE_SEED_ERR);

  const [seedPhraseHidden, setSeedPhraseHidden] = useState(true);

  const [canUseBiometrics, setCanUSeBiometrics] = useState(true); // TODO
  const [enableBiometricsAuth, setEnableBiometricsAuth] = useState(false);

  useEffect(() => {
    deviceHasBiometrics().then((hasBiometrics) => setCanUSeBiometrics(!hasBiometrics));
  }, []);

  useEffect(() => {
    if (isEncryptedStorageFinished && walletPublicValues) setLoading(false);
  }, [walletPublicValues, isEncryptedStorageFinished]);

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
      setSeedPhraseErrorMessage('access.requestSeedPhrase.inputs.seedPhraseErrorLength');
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

  const onPressContinue = async () => {
    const errors = [!seedPhrase, !checkSeedPhrase(), !password, !checkPassword()];
    if (errors.some((err) => err)) return;

    setLoading(true);
    await delay(0.001); // createWalletFromSeedPhrase freeze the app, so we need a delay to impact the loading
    const wallet = createWalletFromSeedPhrase(seedPhrase);

    setWalletPublicValues({
      address: wallet.getAddressString(),
      publicKey: wallet.getPublicKeyString(),
    });

    await Promise.all([
      EncryptedStorage.setItem(StorageKeys.WALLET_PRIVATE_KEY, wallet.getPrivateKeyString()),
      EncryptedStorage.setItem(StorageKeys.PASSWORD, hashFrom(password)),
      (() => enableBiometricsAuth && toggleBiometrics(true))(),
    ]);

    setIsEncryptedStorageFinished(true);
  };

  const disableButton = passwordError || seedPhraseError || !seedPhrase || !password;

  return (
    <ScreenLayout
      title="access.requestSeedPhrase.title"
      bigTitle
      hasFooterBanner
      scroll
    >
      <Form>
        <TextInput
          label="access.requestSeedPhrase.inputs.seedPhrase"
          placeholder="access.requestSeedPhrase.inputs.seedPhrasePH"
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
          label="access.requestSeedPhrase.inputs.password"
          placeholder="access.requestSeedPhrase.inputs.passwordPH"
          type="password"
          value={password}
          onChangeText={onPasswordChange}
          onFocus={onPasswordFocus}
          onBlur={onPasswordBlur}
          error={passwordShowError && passwordError}
          errorMessage={passwordErrorMessage}
        />
        <Switch
          label="access.requestSeedPhrase.useBiometrics"
          value={enableBiometricsAuth}
          disabled={canUseBiometrics}
          onChange={toggleBiometricsSwitch}
        />
      </Form>
      <Button
        text="access.requestSeedPhrase.continueButton"
        disabled={disableButton}
        onPress={onPressContinue}
        loading={loading}
      />
    </ScreenLayout>
  );
};

export default RequestSeedPhraseScreen;
