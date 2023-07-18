import { Blockchains } from '@web3/constants';

type BaseWalletTx = {
  blockchain: Blockchains;
  confirmations: number;
  contractAddress: string;
  from: string;
  hash: string;
  isError: boolean;
  timeStamp: string;
  to: string;
  value: string;
};

export type ERC20WalletTx = BaseWalletTx & {
  gasPrice: string;
  gasUsed: number;
  bandwith?: number;
  energy?: number;
};

export type TronWalletTx = BaseWalletTx & {
  bandwith: number;
  energy: number;
  gasPrice?: string;
  gasUsed?: number;
};

export type WalletTx = ERC20WalletTx | TronWalletTx;

export type GetWalletTxs<T> = (
  address: string,
  tokenAddress: string,
  blockchain: Blockchains,
  options: {
    page: number;
    offset: number;
  },
) => Promise<T[]>;
