import { Blockchains, DEFAULT_BLOCKCHAIN } from './constants';
import { isDev } from '@utils/config';

export const BASE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
export const GWEI = 'Gwei';

export enum TokenSymbol {
  ETH = 'ETH',
  BTC = 'BTC',
  POL = 'POL',
  BNB = 'BNB',
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI',
  TRX = 'TRX',
  UNI = 'UNI',
  USDJ = 'USDJ',
  ARBI = 'ARBI',
}

export type TokenType = {
  name: string;
  symbol: TokenSymbol;
  iconName: string;
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
    iconName: TokenSymbol.ETH,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.POL]: {
    name: 'POL',
    symbol: TokenSymbol.POL,
    iconName: 'POLYG',
    address: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    decimals: 18,
  },
  [TokenSymbol.BNB]: {
    name: 'BNB',
    symbol: TokenSymbol.BNB,
    iconName: TokenSymbol.BNB,
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
  [TokenSymbol.USDC]: {
    name: 'USD Coin',
    symbol: TokenSymbol.USDC,
    iconName: TokenSymbol.USDC,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    iconName: TokenSymbol.DAI,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
  },
};

const TOKENS_ETH_TESTNET: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    iconName: TokenSymbol.ETH,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.BNB]: {
    name: 'BNB',
    symbol: TokenSymbol.BNB,
    iconName: TokenSymbol.BNB,
    address: '0x871ACbEabBaf8Bed65c22ba7132beCFaBf8c27B5',
    decimals: 18,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    iconName: TokenSymbol.DAI,
    address: '0x82fb927676b53b6eE07904780c7be9b4B50dB80b',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: '0xA1d7f71cbBb361A77820279958BAC38fC3667c1a',
    decimals: 6,
  },
  [TokenSymbol.UNI]: {
    name: 'Uniswap',
    symbol: TokenSymbol.UNI,
    iconName: TokenSymbol.UNI,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
  },
};

export const TOKENS_POLYGON: TokensStruct = {
  [TokenSymbol.POL]: {
    name: 'POL',
    symbol: TokenSymbol.POL,
    iconName: 'POLYG',
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    iconName: TokenSymbol.ETH,
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    decimals: 18,
  },
  [TokenSymbol.BNB]: {
    name: 'BNB',
    symbol: TokenSymbol.BNB,
    iconName: TokenSymbol.BNB,
    address: '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
  },
  [TokenSymbol.USDC]: {
    name: 'USD Coin',
    symbol: TokenSymbol.USDC,
    iconName: TokenSymbol.USDC,
    address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    iconName: TokenSymbol.DAI,
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    decimals: 18,
  },
};

export const TOKENS_BSC: TokensStruct = {
  [TokenSymbol.BNB]: {
    name: 'BNB',
    symbol: TokenSymbol.BNB,
    iconName: TokenSymbol.BNB,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    iconName: TokenSymbol.ETH,
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
  },
  [TokenSymbol.BTC]: {
    name: 'Bitcoin',
    symbol: TokenSymbol.BTC,
    iconName: TokenSymbol.BTC,
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
  },
  [TokenSymbol.USDC]: {
    name: 'USD Coin',
    symbol: TokenSymbol.USDC,
    iconName: TokenSymbol.USDC,
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    iconName: TokenSymbol.DAI,
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    decimals: 18,
  },
};

export const TOKENS_ARBITRUM_MAINNET: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    iconName: TokenSymbol.ETH,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    decimals: 6,
  },
  [TokenSymbol.USDC]: {
    name: 'USD Coin',
    symbol: TokenSymbol.USDC,
    iconName: TokenSymbol.USDC,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    iconName: TokenSymbol.DAI,
    address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    decimals: 18,
  },
};

export const TOKENS_ARBITRUM_TESTNET: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    iconName: TokenSymbol.ETH,
    address: BASE_TOKEN_ADDRESS,
    decimals: 18,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: '0x0A5027BaF22A152B4c7C4398b0A8da89f2595369',
    decimals: 6,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    iconName: TokenSymbol.DAI,
    address: '0xE3F5c1EF484dAA21cba0529862ad9b24f78D5121',
    decimals: 18,
  },
};

const TOKENS_TRON_MAINNET: TokensStruct = {
  [TokenSymbol.TRX]: {
    name: 'Tron',
    symbol: TokenSymbol.TRX,
    iconName: TokenSymbol.TRX,
    address: BASE_TOKEN_ADDRESS,
    decimals: 6,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    iconName: TokenSymbol.USDT,
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
  },
};

const TOKENS_TRON_TESTNET: TokensStruct = {
  [TokenSymbol.TRX]: {
    name: 'Tron',
    symbol: TokenSymbol.TRX,
    iconName: TokenSymbol.TRX,
    address: BASE_TOKEN_ADDRESS,
    decimals: 6,
  },
  [TokenSymbol.USDJ]: {
    name: 'Tether USDJ',
    symbol: TokenSymbol.USDJ,
    iconName: TokenSymbol.USDJ,
    address: 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL',
    decimals: 18,
  },
};

export const TOKENS_TRON = isDev() ? TOKENS_TRON_TESTNET : TOKENS_TRON_MAINNET;
export const TOKENS_ETH = isDev() ? TOKENS_ETH_TESTNET : TOKENS_ETH_MAINNET;
export const TOKENS_ARBITRUM = isDev() ? TOKENS_ARBITRUM_TESTNET : TOKENS_ARBITRUM_MAINNET;

const TOKENS_BY_BLOCKCHAIN = {
  [Blockchains.ETHEREUM]: TOKENS_ETH,
  [Blockchains.POLYGON]: TOKENS_POLYGON,
  [Blockchains.BSC]: TOKENS_BSC,
  [Blockchains.ARBITRUM]: TOKENS_ARBITRUM,
  [Blockchains.TRON]: TOKENS_TRON,
};

const getTokens = (blockchain?: Blockchains) => (blockchain
  ? TOKENS_BY_BLOCKCHAIN[blockchain]
  : TOKENS_BY_BLOCKCHAIN[DEFAULT_BLOCKCHAIN]
);

export default getTokens;
