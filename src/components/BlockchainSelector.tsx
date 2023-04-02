import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import Select, { SelectProps } from './Select';
import TokenIcon from './TokenIcon';
import useBlockchainData from '@hooks/useBlockchainData';
import { Blockchains } from '@web3/constants';

type BlockchainSelectorProps = {
  label?: SelectProps['label'];
  disabled?: SelectProps['disabled'];
  style?: SelectProps['style'];
};

const BlockchainSelector = ({
  label,
  disabled,
  style,
}: BlockchainSelectorProps) => {
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
    <Select
      style={style}
      label={label}
      disabled={disabled}
      options={blockchains}
      selected={blockchain}
      onChange={(newBlockchain) => setBlockchain(newBlockchain.value as Blockchains)}
    />
  );
};

export default BlockchainSelector;
