import { parseUnits } from 'ethers';
import { zipObject } from 'lodash';

import { GetBalance } from './types';
import { tronProvider } from '@web3/providers';
import getTokens, { BASE_TOKEN_ADDRESS, TokensBalance } from '@web3/tokens';

export const TRON_ADDRESS_REGEX = /T[A-Za-z1-9]{33}/;
export const TRON_DERIVATION_PATH = "m/44'/195'/0'/0"; // m/purpose'/coin_type'/account'/change/index

// TODO - try to do only one fetch
export const getTronWalletBalance: GetBalance = async (
  blockchain,
  walletAddress,
) => {
  const tokens = getTokens(blockchain);
  const tokenAddresses = Object.values(tokens).map(({ address }) => address);

  const trxBalanceResponse = await tronProvider.trx.getBalance(walletAddress);
  const trxBalance = parseUnits(trxBalanceResponse.toString(), 0);

  const otherTokensAddresses = tokenAddresses.filter((address) => address !== BASE_TOKEN_ADDRESS);

  const otherBalances = await Promise.all(
    otherTokensAddresses.map(async (tAddress) => {
      const { abi } = await tronProvider.trx.getContract(tAddress);
      const contract = tronProvider.contract(abi.entrys, tAddress);
      const balance = await contract.balanceOf(walletAddress).call();

      return parseUnits(balance.toString(), 0);
    }),
  );

  return zipObject(
    Object.keys(tokens),
    [trxBalance, ...otherBalances].map((balance: bigint) => balance),
  ) as TokensBalance;
};

export const setTronAddress = (address?: string) => {
  if (!address) return;

  tronProvider.setAddress(address);
};

export const getTronAddressFromPrivateKey = (privateKey: string) => tronProvider.address.fromPrivateKey(privateKey);
