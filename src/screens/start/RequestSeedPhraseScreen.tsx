import React, { useState } from 'react';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';
import { PASSWORD_REGEX } from '@utils/text';
import { SEED_PHRASE_VALID_LENGTH, isValidSeedPhrase, formatSeedPhrase } from '@web3/wallet';

const PasswordInput = styled(TextInput)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const Form = styled.View`
  height: 350px;
`;

const BASE_PASS_ERR = 'access.requestSeedPhrase.inputs.passwordError';
const BASE_SEED_ERR = 'access.requestSeedPhrase.inputs.seedPhraseError';

type RequestSeedPhraseScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.requestSeedPhrase>;

const RequestSeedPhraseScreen = ({ navigation }: RequestSeedPhraseScreenProps) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [seedPhraseError, setSeedPhraseError] = useState(false);
  const [seedPhraseHidden, setSeedPhraseHidden] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);
  const [seedPhraseErrorMessage, setSeedPhraseErrorMessage] = useState(BASE_SEED_ERR);

  const onSeedChange = (newValue: string) => setSeedPhrase(newValue);
  const onPasswordChange = (newValue: string) => setPassword(newValue);

  const checkSeedPhrase = () => {
    if (!seedPhrase) return false;
    const seedArray = formatSeedPhrase(seedPhrase).split(' ').map((word) => word.trim());
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

    return someError;
  };

  const checkPassword = () => {
    if (!password) return false;

    if (!PASSWORD_REGEX.test(password)) {
      setPasswordErrorMessage(BASE_PASS_ERR);
      setPasswordError(true);
      return true;
    }

    return false;
  };

  const onSeedPhraseFocus = () => setSeedPhraseError(false);
  const onPasswordFocus = () => setPasswordError(false);

  const onPressToggleVisibilitySeedPhrase = () => setSeedPhraseHidden(!seedPhraseHidden);

  const onPressContinue = () => {
    if (passwordError || seedPhraseError) return;

    const inputErrors = [checkSeedPhrase(), checkPassword()];
    if (inputErrors.some((err) => err)) return;

    navigation.navigate(ScreenName.createSeedPhrase); // TODO
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
          multiline={!seedPhraseHidden}
          value={seedPhrase}
          onChangeText={onSeedChange}
          onFocus={onSeedPhraseFocus}
          onBlur={checkSeedPhrase}
          onPressIcon={onPressToggleVisibilitySeedPhrase}
          error={seedPhraseError}
          errorMessage={seedPhraseErrorMessage}
        />
        <PasswordInput
          label="access.requestSeedPhrase.inputs.password"
          placeholder="access.requestSeedPhrase.inputs.passwordPH"
          type="password"
          value={password}
          onChangeText={onPasswordChange}
          onFocus={onPasswordFocus}
          onBlur={checkPassword}
          error={passwordError}
          errorMessage={passwordErrorMessage}
        />
      </Form>
      <Button
        text="access.requestSeedPhrase.continueButton"
        disabled={disableButton}
        onPress={onPressContinue}
      />
    </ScreenLayout>
  );
};

export default RequestSeedPhraseScreen;
