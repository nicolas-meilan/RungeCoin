import React, { useState } from 'react';

import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import ScreenName from '@navigation/screenName';
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

const RequestSeedPhraseScreen = ({ navigation }: any) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [seedPhraseError, setSeedPhraseError] = useState(false);
  const [seedPhraseHidden, setSeedPhraseHidden] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);
  const [seedPhraseErrorMessage, setSeedPhraseErrorMessage] = useState(BASE_SEED_ERR);

  const onSeedChange = (newValue: string) => setSeedPhrase(newValue);
  const onPasswordChange = (newValue: string) => setPassword(newValue);

  const onPasswordBlur = () => {
    const hasError = !!password && !PASSWORD_REGEX.test(password);
    setPasswordError(hasError);
    if (hasError) setPasswordErrorMessage(BASE_PASS_ERR);
  };

  const onSeedPhraseFocus = () => setSeedPhraseError(false);
  const onPasswordFocus = () => setPasswordError(false);

  const onPressToggleVisibilitySeedPhrase = () => setSeedPhraseHidden(!seedPhraseHidden);

  const onPressContinue = () => {
    if (passwordError || seedPhraseError) return;

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

    if (!PASSWORD_REGEX.test(password)) {
      setPasswordErrorMessage(BASE_PASS_ERR);
      setPasswordError(true);
      someError = true;
    }

    if (someError) return;
    navigation.navigate(ScreenName.createSeedPhrase);
  };

  const disableButton = passwordError || seedPhraseError || !seedPhrase || !password;

  return (
    <ScreenLayout
      title="access.requestSeedPhrase.title"
      bigTitle
      hasFooterBanner
      hasBack={false}
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
          onBlur={onPasswordBlur}
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
