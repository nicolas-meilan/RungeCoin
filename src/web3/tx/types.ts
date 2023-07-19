import { BigNumber } from 'ethers';

import { WalletTx } from '@http/tx/types';
import { Blockchains } from '@web3/constants';
import { TokenType } from '@web3/tokens';

type SignOptions = {
  privateKey?: string | null;
  isHw?: boolean;
  hwBluetooth?: boolean;
};

export type SenndTxReturn<T> = {
  hash: string;
  tx?: T;
};

export type SendTx<T> = (
  blockchain: Blockchains,
  fromAddress: string,
  toAddress: string,
  token: TokenType,
  quantity: BigNumber | number | string,
  signOptions: SignOptions,
) => Promise<SenndTxReturn<T>>;

export type ERC20TxFees = {
  gasPrice: BigNumber;
  gasUnits: BigNumber;
  totalFee: BigNumber;
  bandwithNeeded?: null;
  energyNeeded?: null;
  accountEnergy?: null;
  accountBandwidth?: null;
  bandwithPrice?: null;
  energyPrice?: null;
  bandwithFee?: null;
  energyFee?: null;
  activationFee?: null;
};

export type TronTxFees = {
  bandwithNeeded: number;
  energyNeeded: number;
  accountEnergy: number;
  accountBandwidth: number;
  bandwithPrice: number;
  energyPrice: number;
  bandwithFee: BigNumber;
  energyFee: BigNumber;
  activationFee: BigNumber;
  totalFee: BigNumber;
  gasPrice?: null;
  gasUnits?: null;
};

export type TxFees = ERC20TxFees | TronTxFees;

export type EstimateFees<T> = (
  blockchain: Blockchains,
  fromAddress: string,
  toAddress: string,
  token: TokenType,
  quantity?: BigNumber | number | string,
) => Promise<T>;

export type ProcessTxToSave<T> = (config: {
  tx?: WalletTx;
  hash: string;
  blockchain: Blockchains;
  needsUpdate?: boolean;
}) => Promise<T | null>;
