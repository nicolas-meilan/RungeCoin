import React, { useEffect, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import styled from 'styled-components/native';

import Button from '@components/Button';
import ScreenLayout from '@components/ScreenLayout';
import TextInput from '@components/TextInput';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import StorageKeys from '@system/storageKeys';
import { hashFrom } from '@utils/security';

const PasswordInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type RequestPasswordScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.requestPassword>;

const RequestPasswordScreen = ({ navigation }: RequestPasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const [userPassword, setUserPassword] = useState<string | null>(null);

  useEffect(() => {
    EncryptedStorage.getItem(StorageKeys.PASSWORD)
      .then((newUserPassword) => setUserPassword(newUserPassword));
  }, []);

  const goToHome = () => navigation.reset({
    index: 0,
    routes: [{ name: ScreenName.home }],
  });

  const onPressContinue = () => {
    const passwordOk = userPassword === hashFrom(password);

    if (!passwordOk) return;

    goToHome();
  };

  return (
    <ScreenLayout
      title='main.requestPassword.title'
      bigTitle
      hasBack={false}
      hasFooterBanner
    >
      <PasswordInput
        label="main.requestPassword.inputs.password"
        placeholder="main.requestPassword.inputs.passwordPH"
        type="password"
        value={password}
        onChangeText={(newPassword: string) => setPassword(newPassword)}
      />

      <Button
        disabled={!password || !userPassword}
        text="common.continue"
        onPress={onPressContinue}
      />
    </ScreenLayout>
  );
};

export default RequestPasswordScreen;
