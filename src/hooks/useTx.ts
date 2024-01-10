import { useState } from 'react';

import useBlockchainData from './useBlockchainData';
import usePrivateKey from './usePrivateKey';
import useWalletPublicValues from './useWalletPublicValues';
import { WalletTx } from '@http/tx/types';
import type { TokenType } from '@web3/tokens';
import {
  estimateTxFees as web3EstimateTxFees,
  sendTx,
} from '@web3/tx';
import { SenndTxReturn, TxFees } from '@web3/tx/types';

export const ERC20_CONFIRMATIONS_TO_SUCCESS_TRANSACTION = 5;
export const TRON_CONFIRMATIONS_TO_SUCCESS_TRANSACTION = 1;

type UseTxReturn = {
  estimatedTxFees: TxFees | null;
  estimatedTxFeesLoading: boolean;
  estimatedTxFeesError: boolean;
  fetchEstimateTxFees: (toAddress: string, token: TokenType) => void;
  sendToken: (toAddress: string, token: TokenType, amount: bigint | number | string, encryptionKey?: string) => void;
  sendTokenLoading: boolean;
  sendTokenError: boolean;
};

type UseTxProps = {
  onSendFinish?: (txReturn: SenndTxReturn<WalletTx | undefined>) => void;
};

const useTx = ({ onSendFinish }: UseTxProps = {}): UseTxReturn => {
  const { getPrivateKey } = usePrivateKey();
  const { walletPublicValues, address } = useWalletPublicValues();
  const { blockchain } = useBlockchainData();

  const [estimatedTxFees, setEstimatedTxFees] = useState<TxFees | null>(null);
  const [estimatedTxFeesLoading, setEstimatedTxFeesLoading] = useState(false);
  const [estimatedTxFeesError, setEstimatedTxFeesError] = useState(false);

  const [sendTokenLoading, setSendTokenLoading] = useState(false);
  const [sendTokenError, setSendTokenError] = useState(false);

  const fetchEstimateTxFees: UseTxReturn['fetchEstimateTxFees'] = async (toAddress, token) => {
    if (!address) return;
    setEstimatedTxFeesLoading(true);
    setEstimatedTxFeesError(false);
    try {
      const newTxinfo = await web3EstimateTxFees(blockchain, address, toAddress, token);
      setEstimatedTxFees(newTxinfo);
    } catch (error) {
      setEstimatedTxFeesError(true);
      setEstimatedTxFees(null);
    }
    setEstimatedTxFeesLoading(false);
  };

  const sendToken: UseTxReturn['sendToken'] = async (toAddress, token, amount, encryptionKey) => {
    setSendTokenLoading(true);
    setSendTokenError(false);
    try {
      const privateKey = await getPrivateKey(blockchain, encryptionKey);

      if (!walletPublicValues || !address) {
        setSendTokenLoading(false);
        setSendTokenError(true);
        return;
      }

      const data = await sendTx(blockchain, address, toAddress, token, amount, {
        privateKey,
        isHw: walletPublicValues.isHw,
        hwBluetooth: walletPublicValues.hwConnectedByBluetooth,
      });

      onSendFinish?.(data);
    } catch (error) {
      setSendTokenError(true);
    }
    setSendTokenLoading(false);

  };

  return {
    estimatedTxFees,
    estimatedTxFeesLoading,
    estimatedTxFeesError,
    fetchEstimateTxFees,
    sendToken,
    sendTokenLoading,
    sendTokenError,
  };
};

export default useTx;
