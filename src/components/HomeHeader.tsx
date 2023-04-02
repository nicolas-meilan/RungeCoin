import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import Select from './Select';
import Svg from './Svg';
import TokenIcon from './TokenIcon';
import defaultTokenIcon from '@assets/defaultTokenIcon.svg';
import useBlockchainData from '@hooks/useBlockchainData';
import { Blockchains } from '@web3/constants';

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(10)};
`;

const SelectWrapper = styled.View`
  width: 240px;
`;

const ConfigurationSvg = styled(Svg)`
  border-radius: 2000px;
  overflow: hidden;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.statics.black};
`;

const HomeHeader = () => {
  const { t } = useTranslation();
  const {
    blockchain,
    blockchainsBaseTokenSymbols,
    setBlockchain,
  } = useBlockchainData();

  const blockchains = useMemo(() => (
    Object.keys(blockchainsBaseTokenSymbols) as Blockchains[]
  ).map((blockchainKey) => ({
    value: blockchainKey,
    label: t(`blockchain.${blockchainKey}`),
    leftComponent: <TokenIcon tokenSymbol={blockchainsBaseTokenSymbols[blockchainKey]} size={24} />,
    data: undefined,
  })), [blockchainsBaseTokenSymbols]);

  return (
    <Header>
      <SelectWrapper>
        <Select
          options={blockchains}
          selected={blockchain}
          onChange={(newBlockchain) => setBlockchain(newBlockchain.value as Blockchains)}
        />
      </SelectWrapper>
      <TouchableOpacity onPress={() => { }}>
        <ConfigurationSvg svg={defaultTokenIcon} size={40} />
      </TouchableOpacity>
    </Header>
  );
};

export default HomeHeader;
