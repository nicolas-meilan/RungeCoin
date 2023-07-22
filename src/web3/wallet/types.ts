import type { Blockchains } from '@web3/constants';
import type { TokensBalance } from '@web3/tokens';

export type GetBalance = (
  blockchain: Blockchains,
  walletAddress: string,
) => Promise<TokensBalance>;