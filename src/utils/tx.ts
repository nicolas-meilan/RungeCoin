import { CONFIRMATIONS_TO_SUCCESS_TRANSACTION } from '@hooks/useTx';
import type { WalletTx } from '@http/tx';

export const isSendTx = (tx: WalletTx, currentAddress?: string) => (
  (currentAddress || '').toUpperCase() === tx.from.toUpperCase()
);

type TxStatus = 'success' | 'warning' | 'error';
export const txStatus = (tx: WalletTx): TxStatus => {
  const noErrorStatus = tx.confirmations < CONFIRMATIONS_TO_SUCCESS_TRANSACTION ? 'warning' : 'success';
  return tx.isError ? 'error' : noErrorStatus;
};
