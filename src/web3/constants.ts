export enum Blockchains {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BSC = 'BSC',
}

export const DEFAULT_BLOCKCHAIN = Blockchains.ETHEREUM;

export const BLOCKCHAINS_CONFIG = {
  [Blockchains.ETHEREUM]: {
    hasMaxFeePerGas: true,
  },
  [Blockchains.POLYGON]: {
    hasMaxFeePerGas: true,
  },
  [Blockchains.BSC]: {
    hasMaxFeePerGas: false,
  },
};
