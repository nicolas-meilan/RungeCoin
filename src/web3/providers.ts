import {
  WEB3_ETH_PROVIDER_VENDOR,
  WEB3_POLYGON_PROVIDER_VENDOR,
  WEB3_BSC_PROVIDER_VENDOR,
  WEB3_TRON_PROVIDER_VENDOR,
  WEB3_TRON_TESTNET_PROVIDER_VENDOR,
  WEB3_TRON_PROVIDER_VENDOR_KEY,
} from '@env';
import { ethers } from 'ethers';
import TronWeb from 'tronweb';

import { Blockchains, DEFAULT_BLOCKCHAIN } from './constants';
import { isDev } from '@utils/config';

const ETHEREUM_NETWORK_DEV = 'goerli';
const ETHEREUM_NETWORK_MAIN = 'mainnet';

const ETHEREUM_NETWORK = isDev() ? ETHEREUM_NETWORK_DEV : ETHEREUM_NETWORK_MAIN;
const TRON_PROVIDER = isDev() ? WEB3_TRON_TESTNET_PROVIDER_VENDOR : WEB3_TRON_PROVIDER_VENDOR;

export const ethereumProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, WEB3_ETH_PROVIDER_VENDOR);
export const polygonProvider = new ethers.providers.JsonRpcProvider(WEB3_POLYGON_PROVIDER_VENDOR);
export const bscProvider = new ethers.providers.JsonRpcProvider(WEB3_BSC_PROVIDER_VENDOR);
export const tronProvider = new TronWeb({
  fullHost: TRON_PROVIDER,
  headers: { 'TRON-PRO-API-KEY': WEB3_TRON_PROVIDER_VENDOR_KEY },
});


export const provider = {
  [Blockchains.ETHEREUM]: ethereumProvider,
  [Blockchains.POLYGON]: polygonProvider,
  [Blockchains.BSC]: bscProvider,
  [Blockchains.TRON]: tronProvider,
};

const getProvider = (blockchain?: Blockchains) => (blockchain
  ? provider[blockchain]
  : provider[DEFAULT_BLOCKCHAIN]);

export default getProvider;
