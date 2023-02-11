import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { toBuffer } from 'ethereumjs-util';
import Wallet, { hdkey } from 'ethereumjs-wallet';
import EncryptedStorage from 'react-native-encrypted-storage';

import StorageKeys from '@system/storageKeys';

export const SEED_PHRASE_VALID_LENGTH = [12, 15, 18, 21];
const ETH_DERIVATION_PATH = "m/44'/60'/0'/0"; // m/purpose'/coin_type'/account'/change/index
const SEED_24_WORDS_STRENGTH = 256;
const SEED_12_WORDS_STRENGTH = 128;

export const createSeedPhrase = (with24Words = false) => generateMnemonic(
  with24Words ? SEED_24_WORDS_STRENGTH : SEED_12_WORDS_STRENGTH,
);

export const isValidSeedPhrase = (seedPhrase: string) => validateMnemonic(seedPhrase);

export const formatSeedPhrase = (seedPhrase: string) => seedPhrase.trim().replace(/\s+/g, ' ');

export const createWalletFromSeedPhrase = (mnemonic: string, index: number = 0) => {
  const walletIndex = index > 0 ? index : 0;

  const seed = mnemonicToSeedSync(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const wallet = root.derivePath(`${ETH_DERIVATION_PATH}${walletIndex}`).getWallet();

  return wallet;
};

export const createWalletFromKey = (key: string, isPrivate: boolean = true) => {
  const createWallet = isPrivate ? Wallet.fromPrivateKey : Wallet.fromPublicKey;

  const bufferedKey = toBuffer(key);
  const wallet = createWallet(bufferedKey);

  return wallet;
};

export const storageWallet = async (wallet: Wallet) => {
  await Promise.all([
    () => AsyncStorage.setItem(StorageKeys.WALLET, JSON.stringify({
      address: wallet.getAddressString(),
      publicKey: wallet.getPublicKeyString(),
    })),
    () => EncryptedStorage.setItem(StorageKeys.WALLET_PRIVATE_KEY, wallet.getPrivateKeyString()),
  ]);
};
