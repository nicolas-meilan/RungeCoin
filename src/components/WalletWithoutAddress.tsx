import React from 'react';
import { useWindowDimensions } from 'react-native';

import styled from 'styled-components/native';

import Message from './Message';
import keyAndLock from '@assets/images/keyAndLock.png';
import useBlockchainData from '@hooks/useBlockchainData';

const Wrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const WalletWithoutAddress = () => {
  const { height } = useWindowDimensions();
  const { blockchain } = useBlockchainData();

  return (
    <Wrapper>
      <Message
        noFlex
        image={keyAndLock}
        text="main.home.noAddressAlert"
        i18nArgs={{
          blockchain: blockchain.toLowerCase(),
        }}
        imageSize={height * 0.3}
      />
    </Wrapper>
  );
};

export default WalletWithoutAddress;
