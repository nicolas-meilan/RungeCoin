import {
  WEB3_ETH_PROVIDER_VENDOR,
  WEB3_POLYGON_PROVIDER_VENDOR,
  WEB3_BSC_PROVIDER_VENDOR,
} from '@env';
import { ethers } from 'ethers';

import { Blockchains, DEFAULT_BLOCKCHAIN } from './constants';
import { isDev } from '@utils/config';

const ETHEREUM_NETWORK_DEV = 'goerli';
const ETHEREUM_NETWORK_MAIN = 'mainnet';

const ETHEREUM_NETWORK = isDev() ? ETHEREUM_NETWORK_DEV : ETHEREUM_NETWORK_MAIN;

export const ethereumProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, WEB3_ETH_PROVIDER_VENDOR);
export const polygonProvider = new ethers.providers.JsonRpcProvider(WEB3_POLYGON_PROVIDER_VENDOR);
export const bscProvider = new ethers.providers.JsonRpcProvider(WEB3_BSC_PROVIDER_VENDOR);
export const provider = {
  [Blockchains.ETHEREUM]: ethereumProvider,
  [Blockchains.POLYGON]: polygonProvider,
  [Blockchains.BSC]: bscProvider,
};

const getProvider = (blockchain?: Blockchains) => (blockchain
  ? provider[blockchain]
  : provider[DEFAULT_BLOCKCHAIN]);

export default getProvider;
