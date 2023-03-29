import React from 'react';

import styled from 'styled-components/native';

import ledger from '@assets/images/ledger.svg';
import Button from '@components/Button';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import useWalletPublicValues from '@hooks/useWalletPublicValues';


const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const ConnectWithHwScreen = () => {
  const { setWalletPublicValuesHw } = useWalletPublicValues();

  return (
    <ScreenLayout
      title="access.connectHw.title"
      hasBack={false}
      bigTitle
    >
      <Message
        scroll
        svg={ledger}
        text="access.connectHw.message"
      />
      <Button
        text="access.connectHw.usbConnectionButton"
        onPress={() => setWalletPublicValuesHw()}
        type="tertiary"
      />
      <StyledButton
        text="access.connectHw.bluetoothConectionButton"
        onPress={() => setWalletPublicValuesHw(true)}
        type="tertiary"
      />
    </ScreenLayout>
  );
};

export default ConnectWithHwScreen;
