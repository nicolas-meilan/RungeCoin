import { useState } from 'react';

import { BigNumber } from 'ethers';
import EncryptedStorage from 'react-native-encrypted-storage';

import useWalletPublicValues from './useWalletPublicValues';
import StorageKeys from '@system/storageKeys';
import type { TokenType } from '@web3/tokens';
import {
  estimateTxInfo as web3EstimateTxInfo,
  send,
  TxInfo,
} from '@web3/tx';

type UseTxReturn = {
  estimatedTxInfo: TxInfo | null;
  estimatedTxInfoLoading: boolean;
  estimatedTxInfoError: boolean;
  fetchestimateTxInfo: (toAddress: string, tokenAddress: string) => void;
  sendToken: (toAddress: string, token: TokenType, amount: BigNumber | number | string) => void;
  sendTokenLoading: boolean;
  sendTokenError: boolean;
};

type UseTxProps = {
  onSendFinish?: () => void;
};

const useTx = ({ onSendFinish }: UseTxProps = {}): UseTxReturn => {
  const { walletPublicValues } = useWalletPublicValues();

  const [estimatedTxInfo, setEstimatedTxInfo] = useState<TxInfo | null>(null);
  const [estimatedTxInfoLoading, setEstimatedTxInfoLoading] = useState(false);
  const [estimatedTxInfoError, setEstimatedTxInfoError] = useState(false);

  const [sendTokenLoading, setSendTokenLoading] = useState(false);
  const [sendTokenError, setSendTokenError] = useState(false);

  const fetchestimateTxInfo: UseTxReturn['fetchestimateTxInfo'] = async (toAddress, tokenAddress) => {
    if (!walletPublicValues) return;
    setEstimatedTxInfoLoading(true);
    setEstimatedTxInfoError(false);
    try {
      const newTxinfo = await web3EstimateTxInfo(walletPublicValues.address, toAddress, tokenAddress);
      setEstimatedTxInfo(newTxinfo); 
    } catch (error) {
      setEstimatedTxInfoError(true);
    }
    setEstimatedTxInfoLoading(false);
  };

  const sendToken: UseTxReturn['sendToken'] = async (toAddress, token, amount) => {
    setSendTokenLoading(true);
    setSendTokenError(false);
    try {
      const privateKey = await EncryptedStorage.getItem(StorageKeys.WALLET_PRIVATE_KEY);

      if (!privateKey) {
        setSendTokenLoading(false);
        return;
      }
      await send(privateKey, toAddress, token, amount);
      onSendFinish?.();
    } catch (error) {
      setSendTokenError(true);
    }
    setSendTokenLoading(false);

  };

  return {
    estimatedTxInfo,
    estimatedTxInfoLoading,
    estimatedTxInfoError,
    fetchestimateTxInfo,
    sendToken,
    sendTokenLoading,
    sendTokenError,
  };
};

export default useTx;
