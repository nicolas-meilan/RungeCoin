import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import Select, { SelectProps } from './Select';
import TokenIcon from './TokenIcon';
import useBlockchainData from '@hooks/useBlockchainData';
import useWalletPublicValues, {
  BLOCKCHAIN_PUBLIC_VALUES_CONFIG,
} from '@hooks/useWalletPublicValues';
import { Blockchains, BLOCKCHAINS_CONFIG } from '@web3/constants';

type BlockchainSelectorProps = {
  label?: SelectProps['label'];
  disabled?: SelectProps['disabled'];
  style?: SelectProps['style'];
  disableBlockchainsWithoutAddress?: boolean;
};

const BlockchainSelector = ({
  label,
  disabled,
  style,
  disableBlockchainsWithoutAddress = false,
}: BlockchainSelectorProps) => {
  const { t } = useTranslation();

  const { walletPublicValues } = useWalletPublicValues();

  const {
    blockchain,
    blockchainsBaseToken,
    setBlockchain,
  } = useBlockchainData();

  const blockchains = useMemo(() => (
    Object.keys(blockchainsBaseToken) as Blockchains[]
  ).map((blockchainKey) => ({
    value: blockchainKey,
    label: t(`blockchain.${blockchainKey}`),
    leftComponent: (
      <TokenIcon
        size={24}
        iconName={BLOCKCHAINS_CONFIG[blockchainKey].blockchainSymbol || blockchainsBaseToken[blockchainKey].iconName}
      />),
    data: undefined,
    disabled: disableBlockchainsWithoutAddress
      ? !walletPublicValues?.[BLOCKCHAIN_PUBLIC_VALUES_CONFIG[blockchainKey].addressProp]
      : false,
  })), [blockchainsBaseToken]);

  return (
    <Select
      useDisabledItemStyle
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
