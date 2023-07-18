import {
  ERC20_CONFIRMATIONS_TO_SUCCESS_TRANSACTION,
  TRON_CONFIRMATIONS_TO_SUCCESS_TRANSACTION,
} from '@hooks/useTx';
import type { WalletTx } from '@http/tx/types';
import { Blockchains, ERC20_BLOCKCHAINS } from '@web3/constants';

export const isSendTx = (tx: WalletTx, currentAddress?: string) => (
  (currentAddress || '').toUpperCase() === tx.from.toUpperCase()
);

type TxStatus = 'success' | 'warning' | 'error';
export const txStatus = (tx: WalletTx): TxStatus => {
  const confirmationsNeeded = tx.blockchain === Blockchains.TRON
    ? TRON_CONFIRMATIONS_TO_SUCCESS_TRANSACTION
    : ERC20_CONFIRMATIONS_TO_SUCCESS_TRANSACTION;

  const noErrorStatus = tx.confirmations < confirmationsNeeded ? 'warning' : 'success';
  return tx.isError ? 'error' : noErrorStatus;
};

type Erc20BlockchainsConfiguration<T> = {
  [blockchain in typeof ERC20_BLOCKCHAINS[number]]: T;
};
export const erc20BlockchainsConfigurationPropagation = <T>(config: T): Erc20BlockchainsConfiguration<T> => (
  ERC20_BLOCKCHAINS.reduce((acc, blockchain) => ({
    ...acc,
    [blockchain]: config,
  }), {} as Erc20BlockchainsConfiguration<T>)
);
