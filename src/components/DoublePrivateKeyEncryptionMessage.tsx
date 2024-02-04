import React, { useEffect, useState } from 'react';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import styled, { useTheme } from 'styled-components/native';

import Button from './Button';
import Message from './Message';
import { Spacer } from './Spacer';
import keyAndLock from '@assets/images/keyAndLock.png';
import Modal from '@containers/Modal';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import StorageKeys from '@system/storageKeys';

const Main = styled.View`
  flex: 1;
  justify-content: center;
`;

const Wrapper = styled.View`
  height: 95%;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing(6)};
  margin: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const DoublePrivateKeyEncryptionMessage = () => {
  const navigation = useNavigation<NavigationProp<MainNavigatorType>>();

  const theme = useTheme();
  const {
    getItem,
    setItem,
  } = useAsyncStorage(StorageKeys.DOUBLE_ENCRYPTION_PRIVATE_KEY_FLAG);
  const { walletPublicValues } = useWalletPublicValues();

  const [messageVisible, setMessageVisible] = useState(false);

  useEffect(() => {
    if (walletPublicValues?.isHw) return;

    getItem().then((flagEnabled) => setMessageVisible(flagEnabled?.toLowerCase() !== 'true'));
  }, []);

  if (!messageVisible) return null;

  const onCloseModal = () => {
    setItem('true');
    setMessageVisible(false);
  };

  const onPressActivate = () => {
    onCloseModal();
    navigation.navigate(ScreenName.configuration, { activateDoubleEncrytion: true });
  };

  return (
    <Modal
      visible={messageVisible}
      transparent
      animationType="fade"
      onClose={onCloseModal}
    >
      <Main>
        <Wrapper>
          <Message
            noFlex
            image={keyAndLock}
            text="main.privateKeyDoubleEncryption.message"
            scroll
          />
          <Button text="common.activate" onPress={onPressActivate} />
          <Spacer size={theme.spacingNative(2)} />
          <Button
            text="common.activateLater"
            type="error"
            onPress={onCloseModal}
          />
        </Wrapper>
      </Main>
    </Modal>
  );
};

export default DoublePrivateKeyEncryptionMessage;
