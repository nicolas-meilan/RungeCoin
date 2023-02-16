import { toBuffer } from '@ethereumjs/util';
import {
  generateMnemonic,
  mnemonicToSeed,
  validateMnemonic,
} from 'bip39';
import Wallet, { hdkey } from 'ethereumjs-wallet';
import { Contract } from 'ethers';

import { ethereumProvider } from './providers';
import { BALANCE_CHECKER } from './smartContracts';
import { TOKENS_ETH } from './tokensList';
import { fromDecimalsToFullNumber } from '@utils/formatter';

export const SEED_PHRASE_VALID_LENGTH = [12, 15, 18, 21, 24];
const ETH_DERIVATION_PATH = "m/44'/60'/0'/0"; // m/purpose'/coin_type'/account'/change/index
const SEED_24_WORDS_STRENGTH = 256;
const SEED_12_WORDS_STRENGTH = 128;

export const createSeedPhrase = (with24Words = false) => generateMnemonic(
  with24Words ? SEED_24_WORDS_STRENGTH : SEED_12_WORDS_STRENGTH,
);

export const isValidSeedPhrase = (seedPhrase: string) => validateMnemonic(seedPhrase);

export const formatSeedPhrase = (seedPhrase: string) => seedPhrase.trim().replace(/\s+/g, ' ');

export const createWalletFromSeedPhrase = async (mnemonic: string, index: number = 0) => {
  const walletIndex = index > 0 ? index : 0;

  const seed = await mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const wallet = root.derivePath(`${ETH_DERIVATION_PATH}/${walletIndex}`).getWallet();

  return wallet;
};

export const createWalletFromKey = (key: string, isPrivate: boolean = true) => {
  const createWallet = isPrivate ? Wallet.fromPrivateKey : Wallet.fromPublicKey;

  const bufferedKey = toBuffer(key);
  const wallet = createWallet(bufferedKey);

  return wallet;
};

export const getBalanceFromWallet = async (walletAddress: string) => {
  const tokenAddresses = Object.values(TOKENS_ETH).map(({ address }) => address);

  const balanceChecker = new Contract(BALANCE_CHECKER.ethereum.address, BALANCE_CHECKER.ethereum.abi, ethereumProvider);

  const balances = await balanceChecker.balances([walletAddress], tokenAddresses);
  
  const tokensWithBalance = Object.values(TOKENS_ETH).map((token, index) => ({
    ...token,
    balance: fromDecimalsToFullNumber(balances[index].toString(), token.decimals),
  }));
  
  return tokensWithBalance;
};