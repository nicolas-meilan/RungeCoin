import { WEB3_PROVIDER_VENDOR_KEY } from '@env';
import { ethers } from 'ethers';

import { isDev } from '@utils/config';

const ETHEREUM_NETWORK_DEV = 'goerli';
const ETHEREUM_NETWORK_MAIN = 'mainnet';

const ETHEREUM_NETWORK = isDev() ? ETHEREUM_NETWORK_DEV : ETHEREUM_NETWORK_MAIN;

const ethereumProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, WEB3_PROVIDER_VENDOR_KEY);

export {
  ethereumProvider,
};
