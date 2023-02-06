import { generateMnemonic, mnemonicToSeed } from 'bip39';
import { toBuffer } from 'ethereumjs-util';
import Wallet, { hdkey } from 'ethereumjs-wallet';

const ETH_DERIVATION_PATH = "m/44'/60'/0'/0"; // m/purpose'/coin_type'/account'/change/index
const SEED_24_WORDS_STRENGTH = 256;
const SEED_12_WORDS_STRENGTH = 128;

export const createSeedPhrase = (with24Words = false) => generateMnemonic(
  with24Words ? SEED_24_WORDS_STRENGTH : SEED_12_WORDS_STRENGTH,
);

export const createWalletFromSeedPhrase = async (mnemonic: string, index: number = 0) => {
  const walletIndex = index > 0 ? index : 0;

  const seed = await mnemonicToSeed(mnemonic);
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
