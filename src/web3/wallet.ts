import { toBuffer } from '@ethereumjs/util';
import AppEth from '@ledgerhq/hw-app-eth';
import TransportHID from '@ledgerhq/react-native-hid';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {
  generateMnemonic,
  mnemonicToSeed,
  validateMnemonic,
} from 'bip39';
import Wallet, { hdkey } from 'ethereumjs-wallet';
import { BigNumber, Contract } from 'ethers';
import { zipObject } from 'lodash';

import { ethereumProvider } from './providers';
import { BALANCE_CHECKER } from './smartContracts';
import { TokensBalance, TOKENS_ETH } from './tokens';
import { requestBluetoothScanPermission } from '@system/bluetooth';

export const WALLET_ADRESS_LENGTH = 42;
export const WALLET_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/;
export const SEED_PHRASE_VALID_LENGTH = [12, 15, 18, 21, 24];
const ETH_DERIVATION_PATH = "m/44'/60'/0'/0"; // m/purpose'/coin_type'/account'/change/index
const SEED_24_WORDS_STRENGTH = 256;
const SEED_12_WORDS_STRENGTH = 128;
const BASE_ADDRESS_INDEX = 0;

const HW_BLUETOOTH_MAX_TIME = 20000;

export const createSeedPhrase = (with24Words = false) => generateMnemonic(
  with24Words ? SEED_24_WORDS_STRENGTH : SEED_12_WORDS_STRENGTH,
);

export const isValidSeedPhrase = (seedPhrase: string) => validateMnemonic(seedPhrase);

export const formatSeedPhrase = (seedPhrase: string) => seedPhrase.trim().replace(/\s+/g, ' ');

export const createWalletFromSeedPhrase = async (mnemonic: string, index: number = BASE_ADDRESS_INDEX) => {
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

export const getBalanceFromWallet = async (walletAddress: string): Promise<TokensBalance> => {
  const tokenAddresses = Object.values(TOKENS_ETH).map(({ address }) => address);

  const balanceChecker = new Contract(BALANCE_CHECKER.ethereum.address, BALANCE_CHECKER.ethereum.abi, ethereumProvider);

  const balances: BigNumber[] = await balanceChecker.balances([walletAddress], tokenAddresses);

  return zipObject(Object.keys(TOKENS_ETH), balances.map((balance: BigNumber) => balance)) as TokensBalance;
};

export type WalletPublicValues = {
  publicKey: string;
  address: string;
};

export const NO_LEDGER_CONNECTED_ERROR = 'No ledger connected';

const getBluetoothHw = async () => {
  const permissions = await requestBluetoothScanPermission();

  if (!permissions) throw new Error(NO_LEDGER_CONNECTED_ERROR);

  const ledgerList: any[] = [];
  await new Promise<void>((resolve, reject) => {
    const suscription = TransportBLE.listen({
      complete: () => {
        resolve();
        suscription.unsubscribe();
      },
      error: (error) => {
        reject(error);
        suscription.unsubscribe();
      },
      next: (event) => {
        if (event.type === 'add') ledgerList.push(event.descriptor);
      },
    });

    const timeRef = setTimeout(() => {
      suscription.unsubscribe();
      clearTimeout(timeRef);
      reject(new Error(NO_LEDGER_CONNECTED_ERROR));
    }, HW_BLUETOOTH_MAX_TIME);
  });

  return ledgerList;
};

export const getHwWalletAddress = async ({
  index,
  bluetoothConnection,
}: {
  index?: number;
  bluetoothConnection?: boolean;
} = {
  index: BASE_ADDRESS_INDEX,
  bluetoothConnection: false,
}): Promise<WalletPublicValues> => {
  const walletIndex = (index || BASE_ADDRESS_INDEX) > 0 ? index : 0;
  const derivationPath = `${ETH_DERIVATION_PATH}/${walletIndex}`;
  const transportToUse = bluetoothConnection ? TransportBLE : TransportHID;
  const [firstLedger] = await (bluetoothConnection ? getBluetoothHw() : transportToUse.list());

  if (!firstLedger) throw new Error(NO_LEDGER_CONNECTED_ERROR);
  let transport = null;
  try {
    transport = await transportToUse.open(firstLedger);
  } catch (error) { // Retry connection one time
    transport = await transportToUse.open(firstLedger);
  }
  if (!transport) throw new Error(NO_LEDGER_CONNECTED_ERROR);

  const eth = new AppEth(transport);
  const { address, publicKey } = await eth.getAddress(derivationPath, true);
  transport.close();

  return {
    address,
    publicKey,
  };
};