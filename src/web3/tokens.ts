import { Blockchains, DEFAULT_BLOCKCHAIN } from './constants';
import { isDev } from '@utils/config';

export const BASE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
export const GWEI = 'Gwei';

export enum TokenSymbol {
  ETH = 'ETH',
  BTC = 'BTC',
  MATIC = 'MATIC',
  BNB = 'BNB',
  USDT = 'USDT',
  DAI = 'DAI',
  TRX = 'TRX',
  UNI = 'UNI',
  USDJ = 'USDJ',
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
  [token in TokenSymbol]: bigint;
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

export const TOKENS_ETH = isDev() ? TOKENS_ETH_GOERLI : TOKENS_ETH_MAINNET;

export const TOKENS_POLYGON: TokensStruct = {
  [TokenSymbol.MATIC]: {
    name: 'Matic',
    symbol: TokenSymbol.MATIC,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    decimals: 18,
  },
  [TokenSymbol.BNB]: {
    name: 'Token BNB',
    symbol: TokenSymbol.BNB,
    address: '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    decimals: 18,
  },
};

export const TOKENS_BSC: TokensStruct = {
  [TokenSymbol.BNB]: {
    name: 'Token BNB',
    symbol: TokenSymbol.BNB,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
  },
  [TokenSymbol.BTC]: {
    name: 'Bitcoin',
    symbol: TokenSymbol.BTC,
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18,
  },
  [TokenSymbol.MATIC]: {
    name: 'Matic',
    symbol: TokenSymbol.MATIC,
    address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    decimals: 18,
  },
};

const TOKENS_TRON_MAINNET: TokensStruct = {
  [TokenSymbol.TRX]: {
    name: 'Tron',
    symbol: TokenSymbol.TRX,
    address: BASE_TOKEN_ADDRESS,
    decimals: 6,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
  },
};

const TOKENS_TRON_NILE: TokensStruct = {
  [TokenSymbol.TRX]: {
    name: 'Tron',
    symbol: TokenSymbol.TRX,
    address: BASE_TOKEN_ADDRESS,
    decimals: 6,
  },
  [TokenSymbol.USDJ]: {
    name: 'Tether USDJ',
    symbol: TokenSymbol.USDJ,
    address: 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL',
    decimals: 18,
  },
};

export const TOKENS_TRON = isDev() ? TOKENS_TRON_NILE : TOKENS_TRON_MAINNET;

const TOKENS_BY_BLOCKCHAIN = {
  [Blockchains.ETHEREUM]: TOKENS_ETH,
  [Blockchains.POLYGON]: TOKENS_POLYGON,
  [Blockchains.BSC]: TOKENS_BSC,
  [Blockchains.TRON]: TOKENS_TRON,
};

const getTokens = (blockchain?: Blockchains) => (blockchain
  ? TOKENS_BY_BLOCKCHAIN[blockchain]
  : TOKENS_BY_BLOCKCHAIN[DEFAULT_BLOCKCHAIN]
);

export default getTokens;
