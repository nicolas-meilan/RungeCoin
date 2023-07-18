import React, { useState } from 'react';

import styled from 'styled-components/native';

import ledger from '@assets/images/ledger.svg';
import Button from '@components/Button';
import HwConnectionSelector from '@components/HwConnectionSelector';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { Blockchains } from '@web3/constants';

const Content = styled.ScrollView`
  flex: 1;
`;

const ErrorMessage = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

const StyledHwConnectionSelector = styled(HwConnectionSelector)`
  margin-vertical: ${({ theme }) => theme.spacing(6)};
`;

const ConnectWithHwScreen = () => {
  const [hwWalletError, setHwWalletError] = useState(false);

  const {
    walletPublicValues,
    setWalletPublicValuesHw,
    walletPublicValuesLoading,
  } = useWalletPublicValues({
    onSetWalletPublicValuesHwError: () => setHwWalletError(true),
  });

  const hwWalletAction = () => {
    setHwWalletError(false);
    setWalletPublicValuesHw(Blockchains.ETHEREUM, walletPublicValues?.hwConnectedByBluetooth);
  };

  return (
    <ScreenLayout
      title="access.connectHw.title"
      hasBack={false}
      bigTitle
    >
      <Content>
        <Message
          noFlex
          svg={ledger}
          text="hw.guide"
        />
        {hwWalletError && (
          <ErrorMessage text="access.connectHw.hwError" />
        )}
        <StyledHwConnectionSelector initialized />
      </Content>
      <Button
        text="access.connectHw.connectButton"
        onPress={hwWalletAction}
        type="tertiary"
        loading={walletPublicValuesLoading}
      />
    </ScreenLayout>
  );
};

export default ConnectWithHwScreen;
