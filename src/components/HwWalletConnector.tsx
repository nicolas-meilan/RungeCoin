import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import styled from 'styled-components/native';

import ledger from '@assets/images/ledger.svg';
import BlockchainSelector from '@components/BlockchainSelector';
import Button from '@components/Button';
import HwConnectionSelector from '@components/HwConnectionSelector';
import Message from '@components/Message';
import Text from '@components/Text';
import useBlockchainData from '@hooks/useBlockchainData';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

const Spacer = styled.View`
  flex-shrink: 1;
  flex-grow: 1;
`;

const ErrorMessage = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

const StyledHwConnectionSelector = styled(HwConnectionSelector)`
  margin-vertical: ${({ theme }) => theme.spacing(6)};
`;

const MIN_SCREEN_HEIGHT_FOR_IMAGE = 610;

type HwWalletConnectorProps = {
  hasBlockchainSelector?: boolean;
  onConnectionSuccess?: () => void;
};

const HwWalletConnector = ({
  onConnectionSuccess,
  hasBlockchainSelector = false,
}: HwWalletConnectorProps) => {
  const { height } = useWindowDimensions();
  const [hwWalletError, setHwWalletError] = useState('');

  const {
    walletPublicValues,
    setWalletPublicValuesHw,
    walletPublicValuesLoading,
  } = useWalletPublicValues({
    onSetWalletPublicValuesHwError: (error) => setHwWalletError(error),
    onSetWalletPublicValuesHwSuccess: onConnectionSuccess,
  });

  const { blockchain } = useBlockchainData();

  const hwWalletAction = () => {
    setHwWalletError('');
    setWalletPublicValuesHw(blockchain, walletPublicValues?.hwConnectedByBluetooth);
  };

  const renderImage = height > MIN_SCREEN_HEIGHT_FOR_IMAGE;

  return (
    <>
      {hasBlockchainSelector && (
        <BlockchainSelector
          label="hw.selectBlockchain"
        />
      )}
      <Spacer />
      <Message
        imageSize={height * 0.3}
        noFlex
        scroll
        svg={renderImage ? ledger : undefined}
        text={`hw.guide.${blockchain}`}
      />
      {!!hwWalletError && (
        <ErrorMessage text={`error.${hwWalletError}`} />
      )}
      <StyledHwConnectionSelector initialized />
      {!hasBlockchainSelector && <Spacer />}
      <Button
        text="access.connectHw.connectButton"
        onPress={hwWalletAction}
        type="tertiary"
        loading={walletPublicValuesLoading}
      />
    </>
  );
};

export default HwWalletConnector;
