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
import { hashFrom, obtainBiometrics } from '@utils/security';

const PasswordInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type ValidateAccessScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.validateAccess>;

const ValidateAccessScreen = ({ navigation }: ValidateAccessScreenProps) => {
  const [password, setPassword] = useState('');
  const [userPassword, setUserPassword] = useState<string | null>(null);

  const goToHome = () => navigation.reset({
    index: 0,
    routes: [{ name: ScreenName.home }],
  });

  const validateWithBiometrics = async () => {
    try {
      const biometicsEnabled = await obtainBiometrics();
      if (!biometicsEnabled) return;

      goToHome();
    } catch (_) {}
  };

  useEffect(() => {
    validateWithBiometrics();
    EncryptedStorage.getItem(StorageKeys.PASSWORD)
      .then((newUserPassword) => setUserPassword(newUserPassword));
  }, []);

  const onPressContinue = () => {
    const passwordOk = userPassword === hashFrom(password);

    if (!passwordOk) return;

    goToHome();
  };

  return (
    <ScreenLayout
      title='main.validateAccess.title'
      bigTitle
      hasBack={false}
      hasFooterBanner
    >
      <PasswordInput
        label="main.validateAccess.inputs.password"
        placeholder="main.validateAccess.inputs.passwordPH"
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

export default ValidateAccessScreen;
