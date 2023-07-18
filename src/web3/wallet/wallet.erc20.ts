import { BigNumber, Contract, providers } from 'ethers';
import { zipObject } from 'lodash';

import { GetBalance } from './types';
import getProvider from '@web3/providers';
import { BALANCE_CHECKER_ABI, BALANCE_CHECKER_ADDRESS } from '@web3/smartContracts';
import getTokens, { TokensBalance } from '@web3/tokens';

export const ERC20_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/;
export const ETH_DERIVATION_PATH = "m/44'/60'/0'/0"; // m/purpose'/coin_type'/account'/change/index

export const getERC20WalletBalance: GetBalance = async (
  blockchain,
  walletAddress,
) => {
  const tokens = getTokens(blockchain);
  const tokenAddresses = Object.values(tokens).map(({ address }) => address);
  const provider = getProvider(blockchain);

  const balanceChecker = new Contract(
    BALANCE_CHECKER_ADDRESS[blockchain as keyof typeof BALANCE_CHECKER_ADDRESS],
    BALANCE_CHECKER_ABI,
    provider as providers.Provider,
  );
  const walletBalances = await balanceChecker.balances([walletAddress], tokenAddresses);

  return zipObject(
    Object.keys(tokens),
    walletBalances.map((balance: BigNumber) => balance),
  ) as TokensBalance;
};
