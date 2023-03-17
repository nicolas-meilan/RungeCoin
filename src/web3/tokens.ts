import type { BigNumber } from 'ethers';

import { isDev } from '@utils/config';

export const BASE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
export const GWEI = 'Gwei';

export enum TokenSymbol {
  ETH = 'ETH',
  MATIC = 'MATIC',
  BNB = 'BNB',
  USDT = 'USDT',
  DAI = 'DAI',
  UNI = 'UNI',
}

export type TokenType = {
  name: string;
  symbol: TokenSymbol;
  address: string;
  decimals: number;
};

export type TokensStruct = {
  [token in TokenSymbol]?: TokenType;
};

export type TokensBalance = {
  [token in TokenSymbol]: BigNumber;
};

const TOKENS_ETH_MAINNET: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.MATIC]: {
    name: 'Matic',
    symbol: TokenSymbol.MATIC,
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    decimals: 18,
  },
  [TokenSymbol.BNB]: {
    name: 'Token BNB',
    symbol: TokenSymbol.BNB,
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
  },
};

const TOKENS_ETH_GOERLI: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.MATIC]: {
    name: 'Matic',
    symbol: TokenSymbol.MATIC,
    address: '0x88eC360e09A9cD9B37Df80c4cd587Ee375409f8C',
    decimals: 18,
  },
  [TokenSymbol.BNB]: {
    name: 'Token BNB',
    symbol: TokenSymbol.BNB,
    address: '0xfb501A48aFFC39aa4b4C83A025D4F0b5C1ca4A6C',
    decimals: 18,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    address: '0xf2edF1c091f683E3fb452497d9a98A49cBA84666',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    address: '0xC51FceEc013cD34aE2e95E6D64E9858F2aC28fFf',
    decimals: 6,
  },
  [TokenSymbol.UNI]: {
    name: 'Uniswap',
    symbol: TokenSymbol.UNI,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
  },
};

const TOKENS_ETH = isDev() ? TOKENS_ETH_GOERLI : TOKENS_ETH_MAINNET;

export {
  TOKENS_ETH,
};
