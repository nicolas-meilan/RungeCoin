import React, { useState } from 'react';

import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import { PASSWORD_REGEX } from '@utils/text';
import { SEED_PHRASE_VALID_LENGTH, isValidSeedPhrase, formatSeedPhrase, createWalletFromSeedPhrase, storageWallet } from '@web3/wallet';

const PasswordInput = styled(TextInput)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const Form = styled.View`
  height: 350px;
`;

const BASE_PASS_ERR = 'access.requestSeedPhrase.inputs.passwordError';
const BASE_SEED_ERR = 'access.requestSeedPhrase.inputs.seedPhraseError';

const RequestSeedPhraseScreen = () => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [storageLoading, setStorageLoading] = useState(false);

  const [seedPhraseError, setSeedPhraseError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [seedPhraseShowError, setSeedPhraseShowError] = useState(false);
  const [passwordShowError, setPasswordShowError] = useState(false);

  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);
  const [seedPhraseErrorMessage, setSeedPhraseErrorMessage] = useState(BASE_SEED_ERR);

  const [seedPhraseHidden, setSeedPhraseHidden] = useState(true);

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

  const onPressContinue = async () => {
    const errors = [!seedPhrase, !checkSeedPhrase(), !password, !checkPassword()];
    if (errors.some((err) => err)) return;

    setStorageLoading(true);
    try {
      const wallet = createWalletFromSeedPhrase(seedPhrase);
      await storageWallet(wallet);
      setStorageLoading(false);
    } catch (error) {
      setStorageLoading(false);
    }
  };

  const test = () => {
    const wallet = createWalletFromSeedPhrase('prosper turn volcano toilet figure rail oyster ship spider today escape goddess');

    console.log({
      address: wallet.getAddressString(),
      publicKey: wallet.getPublicKeyString(),
    })
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
      </Form>
      <Button
        text="access.requestSeedPhrase.continueButton"
        disabled={disableButton}
        onPress={onPressContinue}
        loading={storageLoading}
      />
      <Button
        text="access.requestSeedPhrase.continueButton"
        onPress={test}
      />
    </ScreenLayout>
  );
};

export default RequestSeedPhraseScreen;
