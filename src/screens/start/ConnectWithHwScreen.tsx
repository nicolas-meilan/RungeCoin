import React, { useState } from 'react';

import styled from 'styled-components/native';

import ledger from '@assets/images/ledger.svg';
import Button from '@components/Button';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import useWalletPublicValues from '@hooks/useWalletPublicValues';


const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const ErrorMessage = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

const ConnectWithHwScreen = () => {
  const [hwWalletError, setHwWalletError] = useState(false);

  const { setWalletPublicValuesHw } = useWalletPublicValues({ 
    onSetWalletPublicValuesHwError: () => setHwWalletError(true),
  });

  const hwWalletAction = (isBluetooth: boolean = false) => {
    setHwWalletError(false);
    setWalletPublicValuesHw(isBluetooth);
  };

  return (
    <ScreenLayout
      title="access.connectHw.title"
      hasBack={false}
      bigTitle
    >
      <Message
        scroll
        svg={ledger}
        text="common.hwGuide"
      />
      {hwWalletError && (
        <ErrorMessage text="access.connectHw.hwError" />
      )}
      <Button
        text="access.connectHw.usbConnectionButton"
        onPress={() => hwWalletAction()}
        type="tertiary"
      />
      <StyledButton
        text="access.connectHw.bluetoothConectionButton"
        onPress={() => hwWalletAction(true)}
        type="tertiary"
      />
    </ScreenLayout>
  );
};

export default ConnectWithHwScreen;
