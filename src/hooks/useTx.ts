import { useState } from 'react';

import { BigNumber } from 'ethers';
import EncryptedStorage from 'react-native-encrypted-storage';

import useBlockchainData from './useBlockchainData';
import useWalletPublicValues from './useWalletPublicValues';
import StorageKeys from '@system/storageKeys';
import type { TokenType } from '@web3/tokens';
import {
  estimateTxInfo as web3EstimateTxInfo,
  send,
  TxInfo,
} from '@web3/tx';

export const CONFIRMATIONS_TO_SUCCESS_TRANSACTION = 5;

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
  onSendFinish?: (txHash: string) => void;
};

const useTx = ({ onSendFinish }: UseTxProps = {}): UseTxReturn => {
  const { walletPublicValues } = useWalletPublicValues();
  const { blockchain } = useBlockchainData();

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
      const newTxinfo = await web3EstimateTxInfo(blockchain, walletPublicValues.address, toAddress, tokenAddress);
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

      if (!walletPublicValues) {
        setSendTokenLoading(false);
        setSendTokenError(true);
        return;
      }

      const txHash = await send(blockchain, walletPublicValues.address, toAddress, token, amount, {
        privateKey,
        isHw: walletPublicValues.isHw,
        hwBluetooth: walletPublicValues.hwConnectedByBluetooth,
      });

      onSendFinish?.(txHash);
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
