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
  quantity: bigint | number | string,
  signOptions: SignOptions,
) => Promise<SenndTxReturn<T>>;

export type ERC20TxFees = {
  gasPrice: bigint;
  gasUnits: bigint;
  totalFee: bigint;
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
  bandwithFee: bigint;
  energyFee: bigint;
  activationFee: bigint;
  totalFee: bigint;
  gasPrice?: null;
  gasUnits?: null;
};

export type TxFees = ERC20TxFees | TronTxFees;

export type EstimateFees<T> = (
  blockchain: Blockchains,
  fromAddress: string,
  toAddress: string,
  token: TokenType,
  quantity?: bigint | number | string,
) => Promise<T>;

export type ProcessTxToSave<T> = (config: {
  tx?: WalletTx;
  hash: string;
  blockchain: Blockchains;
  needsUpdate?: boolean;
}) => Promise<T | null>;

export type AccountResources = {
  totalEnergy: number;
  accountEnergy: number;
  totalBandwidth: number;
  accountBandwidth: number;
};

export const NO_TX_TO_SIGN_ERROR = 'NO_TX_TO_SIGN';
