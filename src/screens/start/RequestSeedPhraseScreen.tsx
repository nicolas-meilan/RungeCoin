import React, { useState } from 'react';

import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import ScreenName from '@navigation/screenName';
import { PASSWORD_REGEX } from '@utils/text';

const Password = styled(TextInput)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const Form = styled.View`
  height: 300px;
`;

const BASE_PASS_ERR = 'access.requestSeedPhrase.inputs.passwordError';

const RequestSeedPhraseScreen = ({ navigation }: any) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(BASE_PASS_ERR);

  const onSeedChange = (newValue: string) => setSeedPhrase(newValue);
  const onPasswordChange = (newValue: string) => setPassword(newValue);

  const onPasswordBlur = () => {
    const hasError = !!password && !PASSWORD_REGEX.test(password);
    setPasswordError(hasError);
    if (hasError) setPasswordErrorMessage(BASE_PASS_ERR);
  };
  const onPasswordFocus = () => setPasswordError(false);
  const onPressContinue = () => {
    if (passwordError) return;

    if (!password) {
      setPasswordErrorMessage('access.requestSeedPhrase.inputs.passwordVoid');
      setPasswordError(true);
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setPasswordErrorMessage(BASE_PASS_ERR);
      setPasswordError(true);
      return;
    }

    navigation.navigate(ScreenName.createSeedPhrase);
  };

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
          value={seedPhrase}
          onChangeText={onSeedChange}
        />
        <Password
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
        disabled={passwordError}
        onPress={onPressContinue}
      />
    </ScreenLayout>
  );
};

export default RequestSeedPhraseScreen;
