import React from 'react';

import { BigNumber } from 'ethers';
import { useTheme } from 'styled-components/native';

import TokenItem from './TokenItem';
import useBalances from '@hooks/useBalances';
import { CONFIRMATIONS_TO_SUCCESS_TRANSACTION } from '@hooks/useTx';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import type { WalletTx } from '@http/wallet';
import { TOKENS_ETH } from '@web3/tokens';

const TOKENS = Object.values(TOKENS_ETH);

type TokenActivityItemProps = {
  activityItem: WalletTx;
};

const TokenActivityItem = ({
  activityItem,
}: TokenActivityItemProps) => {
  const theme = useTheme();
  const { walletPublicValues } = useWalletPublicValues();

  const {
    tokenBalancesLoading,
    tokenBalances,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const token = activityItem.contractAddress
    ? TOKENS.find((item) => (
      item.address.toUpperCase() === activityItem.contractAddress.toUpperCase()
    ))
    : TOKENS_ETH.ETH;

  const balance = BigNumber.from(activityItem.value);

  const txSend = (walletPublicValues?.address || '').toUpperCase() === activityItem.from.toUpperCase();
  const rightIcon = txSend ? 'arrow-top-right' : 'arrow-bottom-left';
  const rightIconColor = txSend ? theme.colors.error : theme.colors.success;

  const noErrorStatus = activityItem.confirmations < CONFIRMATIONS_TO_SUCCESS_TRANSACTION ? 'warning' : 'success';
  const status = activityItem.isError ? 'error' : noErrorStatus;

  if (!token) return null;

  return (
    <TokenItem
      {...token}
      balance={balance}
      balanceLoading={!tokenBalances && tokenBalancesLoading}
      rightIcon={rightIcon}
      rightIconColor={rightIconColor}
      status={status}
    />
  );
};

export default TokenActivityItem;
