
import { ERC20_TX_URL, getERC20WalletTxs } from './erc20.tx';
import { TRON_TX_URL, getTronWalletTxs } from './tron.tx';
import { GetWalletTxs, WalletTx } from './types';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';
import { Blockchains } from '@web3/constants';

export const TX_URL = {
  ...ERC20_TX_URL,
  [Blockchains.TRON]: TRON_TX_URL,
};

const BLOCKCHAIN_TX_CONFIG = {
  ...erc20BlockchainsConfigurationPropagation({
    getWalletTxs: getERC20WalletTxs,
  }),
  [Blockchains.TRON]: {
    getWalletTxs: getTronWalletTxs,
  },
};

export const getWalletTxs: GetWalletTxs<WalletTx> = (
  address,
  tokenAddress,
  blockchain,
  options,
) => BLOCKCHAIN_TX_CONFIG[blockchain]
  .getWalletTxs(
    address,
    tokenAddress,
    blockchain,
    options,
  );
