import { Alert } from 'react-native';

import AppEth from '@ledgerhq/hw-app-eth';
import AppTrx from '@ledgerhq/hw-app-trx';
import TransportHID from '@ledgerhq/react-native-hid';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {
  generateMnemonic,
  mnemonicToSeed,
  validateMnemonic,
} from 'bip39';
import { HDNodeWallet } from 'ethers';
import { t } from 'i18next';
import { Observable } from 'rxjs';

import { GetBalance } from './types';
import { ERC20_ADDRESS_REGEX, ETH_DERIVATION_PATH, getERC20WalletBalance } from './wallet.erc20';
import { TRON_ADDRESS_REGEX, TRON_DERIVATION_PATH, getTronWalletBalance } from './wallet.tron';
import { Blockchains } from '../constants';
import {
  requestBluetoothScanPermission,
  isBeEnabled,
  BE_DISABLED,
} from '@system/bluetooth';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';

// export const BTC_DERIVATION_PATH = "m/44'/0'/0'/0"; // m/purpose'/coin_type'/account'/change/index
export const SEED_PHRASE_VALID_LENGTH = [12, 15, 18, 21, 24];
export const BASE_ADDRESS_INDEX = 0;
const SEED_24_WORDS_STRENGTH = 256;
const SEED_12_WORDS_STRENGTH = 128;

const HW_BLUETOOTH_MAX_TIME = 15000;

type BlockchainWalletConfig = {
  [blockchain in Blockchains]: {
    getWalletBalance: GetBalance;
    addressRegex: RegExp;
    derivationPath: string;
    ledgerApp: typeof AppEth | typeof AppTrx;
  }
};

const BLOCKCHAIN_WALLET_CONFIG: BlockchainWalletConfig = {
  ...erc20BlockchainsConfigurationPropagation({
    getWalletBalance: getERC20WalletBalance,
    addressRegex: ERC20_ADDRESS_REGEX,
    derivationPath: ETH_DERIVATION_PATH,
    ledgerApp: AppEth,
  }),
  [Blockchains.TRON]: {
    getWalletBalance: getTronWalletBalance,
    addressRegex: TRON_ADDRESS_REGEX,
    derivationPath: TRON_DERIVATION_PATH,
    ledgerApp: AppTrx,
  },
};

export const createSeedPhrase = (with24Words = false) => generateMnemonic(
  with24Words ? SEED_24_WORDS_STRENGTH : SEED_12_WORDS_STRENGTH,
);

export const isValidSeedPhrase = (seedPhrase: string) => validateMnemonic(seedPhrase);

export const formatSeedPhrase = (seedPhrase: string) => seedPhrase.trim().replace(/\s+/g, ' ');

export const createWalletFromSeedPhrase = async (mnemonic: string, index: number = BASE_ADDRESS_INDEX) => {
  const walletIndex = index > 0 ? index : 0;

  const seed = await mnemonicToSeed(mnemonic);
  const root = HDNodeWallet.fromSeed(seed);
  const erc20Wallet = root.derivePath(`${ETH_DERIVATION_PATH}/${walletIndex}`);
  const tronWallet = root.derivePath(`${TRON_DERIVATION_PATH}/${walletIndex}`);

  return {
    erc20Wallet,
    tronWallet,
  };
};

export const getAddressRegex = (blockchain: Blockchains) => BLOCKCHAIN_WALLET_CONFIG[blockchain].addressRegex;

export const getDerivationPath = (blockchain: Blockchains) => BLOCKCHAIN_WALLET_CONFIG[blockchain].derivationPath;

export const getLedgerApp = (blockchain: Blockchains) => BLOCKCHAIN_WALLET_CONFIG[blockchain].ledgerApp;

export const getWalletBalance: GetBalance = (
  blockchain,
  walletAddress,
) => BLOCKCHAIN_WALLET_CONFIG[blockchain].getWalletBalance(blockchain, walletAddress);

export const NO_LEDGER_CONNECTED_ERROR = 'hwConnectionError';

type HwDevice = {
  id: string;
  name: string;
  localName: string;
};

const getBluetoothHw = async () => {
  const permissions = await requestBluetoothScanPermission();

  if (!permissions) throw new Error(NO_LEDGER_CONNECTED_ERROR);

  const beEnabled = await isBeEnabled();

  if (!beEnabled) throw new Error(BE_DISABLED);

  const hwList: {
    device: HwDevice;
    tryConnection: boolean;
  }[] = [];

  const selectedHw = await new Promise<null | HwDevice>((resolve, reject) => {
    let procesingConnection = false;
    let timeExceeded = false;

    const onSelectHw = (current: HwDevice, unsubscribe: () => void) => {
      unsubscribe();
      resolve(current);
    };

    const suscription = new Observable(TransportBLE.listen).subscribe({
      complete: () => {
        suscription.unsubscribe();
        resolve(null);
      },
      error: () => {
        suscription.unsubscribe();
        reject(new Error(NO_LEDGER_CONNECTED_ERROR));
      },
      next: async (event) => {
        if (event.type === 'add') {
          if (!procesingConnection && timeExceeded) {
            suscription.unsubscribe();
            resolve(null);
            return;
          }

          const alreadyAdded = hwList.some(({ device }) => device.id === event.descriptor.id);
          if (!alreadyAdded) {
            hwList.push({
              device: event.descriptor,
              tryConnection: true,
            });
          }

          if (!procesingConnection) {
            const currentHw = hwList.find(({ tryConnection }) => tryConnection);
            if (!currentHw) return;
            currentHw.tryConnection = false;
            procesingConnection = true;

            const onEndAlert = () => {
              procesingConnection = false;
            };

            const unsubscribeCallback = () => {
              suscription.unsubscribe();
              onEndAlert();
            };

            Alert.alert(
              t('access.connectHw.title'),
              currentHw.device.name || currentHw.device.localName,
              [{
                text: t('access.connectHw.continueSearchingHw') || '',
                style: 'cancel',
                onPress: onEndAlert,
              }, {
                text: t('access.connectHw.connectButton') || '',
                onPress: () => onSelectHw(currentHw.device, unsubscribeCallback),
              }],
            );
          }
        }
      },
    });

    const timeRef = setTimeout(() => {
      if (procesingConnection) {
        timeExceeded = true;
        clearTimeout(timeRef);
        return;
      }

      try {
        suscription.unsubscribe();
      } catch (error) { }
      clearTimeout(timeRef);
      resolve(null);
    }, HW_BLUETOOTH_MAX_TIME);
  });

  return [selectedHw];
};

export const connectHw = async (bluetoothConnection: boolean = false): Promise<TransportBLE | TransportHID> => {
  const transportToUse = bluetoothConnection ? TransportBLE : TransportHID;
  const [firstHw] = await (bluetoothConnection ? getBluetoothHw() : transportToUse.list());

  if (!firstHw) throw new Error(NO_LEDGER_CONNECTED_ERROR);
  let transport = null;
  try {
    transport = await transportToUse.open(firstHw);
  } catch (_) { // Retry connection one time
    try {
      transport = await transportToUse.open(firstHw);
    } catch (error) {
      throw new Error(NO_LEDGER_CONNECTED_ERROR);
    }
  }
  if (!transport) throw new Error(NO_LEDGER_CONNECTED_ERROR);

  return transport;
};

export const getHwWalletAddress = async (
  blockchain: Blockchains,
  {
    index,
    bluetoothConnection,
  }: {
    index?: number;
    bluetoothConnection?: boolean;
  } = {
    index: BASE_ADDRESS_INDEX,
    bluetoothConnection: false,
  }): Promise<string> => {
  const walletConfig = BLOCKCHAIN_WALLET_CONFIG[blockchain];
  const walletIndex = (index || BASE_ADDRESS_INDEX) > 0 ? index : 0;
  const derivationPath = `${walletConfig.derivationPath}/${walletIndex}`;
  const transport = await connectHw(bluetoothConnection);
  
  try {
    const ledgerApp = new (walletConfig.ledgerApp)(transport);
    const { address } = await ledgerApp.getAddress(derivationPath, true);
    transport.close();

    return address;
  } catch (error) {
    throw new Error(NO_LEDGER_CONNECTED_ERROR);
  }
};
