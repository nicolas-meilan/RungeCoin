import React from 'react';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import TronFees from './TronFees';
import useBlockchainData from '@hooks/useBlockchainData';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';
import { Blockchains } from '@web3/constants';

const BLOCKCHAIN_EXTRA_DATA_CONFIG: {
  [blockchain in Blockchains]: JSX.Element;
} = {
  ...erc20BlockchainsConfigurationPropagation(<></>),
  [Blockchains.TRON]: (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
    >
      <TronFees />
    </Animated.View>
  ),
};

const BlockchainExtraData = () => {
  const { blockchain } = useBlockchainData();

  return BLOCKCHAIN_EXTRA_DATA_CONFIG[blockchain];
};

export default BlockchainExtraData;
