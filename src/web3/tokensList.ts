import bnb from '@assets/tokens/bnb.svg';
import dai from '@assets/tokens/dai.svg';
import eth from '@assets/tokens/eth.svg';
import matic from '@assets/tokens/matic.svg';
import usdt from '@assets/tokens/usdt.svg';
import type { SvgProps } from '@components/Svg';
import { isDev } from '@utils/config';

export enum TokenSymbol {
  ETH = 'ETH',
  MATIC = 'MATIC',
  BNB = 'BNB',
  USDT = 'USDT',
  DAI = 'dai',
}

export type TokenType = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  svg: SvgProps['svg'];
};

export type TokensStruct = {
  [token in TokenSymbol]?: TokenType;
};

const TOKENS_ETH_MAINNET: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    svg: eth,
  },
  [TokenSymbol.MATIC]: {
    name: 'Matic',
    symbol: TokenSymbol.MATIC,
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    decimals: 18,
    svg: matic,
  },
  [TokenSymbol.BNB]: {
    name: 'Token BNB',
    symbol: TokenSymbol.BNB,
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    decimals: 18,
    svg: bnb,
  },
  [TokenSymbol.USDT]: {
    name: 'Tether USD',
    symbol: TokenSymbol.USDT,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    svg: usdt,
  },
  [TokenSymbol.DAI]: {
    name: 'Dai Stablecoin',
    symbol: TokenSymbol.DAI,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    svg: dai,
  },
};

const TOKENS_ETH_GOERLI: TokensStruct = {
  [TokenSymbol.ETH]: {
    name: 'Ether',
    symbol: TokenSymbol.ETH,
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    svg: eth,
  },
};

const TOKENS_ETH = isDev() ? TOKENS_ETH_GOERLI : TOKENS_ETH_MAINNET;

export {
  TOKENS_ETH,
};
