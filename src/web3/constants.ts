import type { TokenSymbol } from './tokens';

export enum Blockchains {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BSC = 'BSC',
  ARBITRUM = 'ARBITRUM',
  TRON = 'TRON',
}

export const BLOCKCHAINS_CONFIG: {
  [blockchain in Blockchains]: {
    hasMaxFeePerGas: boolean;
    isERC20Compatible: boolean;
    blockchainSymbol?: TokenSymbol;
  }
} = {
  [Blockchains.ETHEREUM]: {
    hasMaxFeePerGas: true,
    isERC20Compatible: true,
  },
  [Blockchains.POLYGON]: {
    hasMaxFeePerGas: false,
    isERC20Compatible: true,
  },
  [Blockchains.BSC]: {
    hasMaxFeePerGas: false,
    isERC20Compatible: true,
  },
  [Blockchains.ARBITRUM]: {
    hasMaxFeePerGas: false,
    isERC20Compatible: true,
    blockchainSymbol: 'ARBI' as TokenSymbol,
  },
  [Blockchains.TRON]: {
    hasMaxFeePerGas: true,
    isERC20Compatible: false,
  },
};

const ORDERED_BLOCKCHAINS = Object.keys(BLOCKCHAINS_CONFIG) as Blockchains[];
export const ERC20_BLOCKCHAINS = Object.values(BLOCKCHAINS_CONFIG).reduce((acc, config, index) => {
  if (config.isERC20Compatible) {
    acc.push(ORDERED_BLOCKCHAINS[index]);
  }

  return acc;
}, [] as Blockchains[]);

export const DEFAULT_BLOCKCHAIN = Blockchains.ETHEREUM;
