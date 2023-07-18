import { erc20IsValidAddressToSend, erc20ProcessTxToSave, erc20send, estimateErc20TxFees } from './erc20.tx';
import { estimateTronFees, tronIsValidAddressToSend, tronProcessTxToSave, tronSend } from './tron.tx';
import { EstimateFees, ProcessTxToSave, SendTx, TxFees } from './types';
import { ERC20WalletTx, TronWalletTx, WalletTx } from '@http/tx/types';
import { erc20BlockchainsConfigurationPropagation } from '@utils/web3';
import { Blockchains } from '@web3/constants';

const BLOCKCHAINS_TX_CONFIG = {
  ...erc20BlockchainsConfigurationPropagation({
    sendTx: erc20send,
    estimateTxFees: estimateErc20TxFees,
    processTxToSave: erc20ProcessTxToSave,
    isValidAddressToSend: erc20IsValidAddressToSend,
  }),
  [Blockchains.TRON]: {
    sendTx: tronSend,
    estimateTxFees: estimateTronFees,
    processTxToSave: tronProcessTxToSave,
    isValidAddressToSend: tronIsValidAddressToSend,
  },
};

export const sendTx: SendTx<WalletTx | undefined> = async (
  blockchain,
  fromAddress,
  toAddress,
  token,
  quantity,
  signOptions,
) => BLOCKCHAINS_TX_CONFIG[blockchain].sendTx(
  blockchain,
  fromAddress,
  toAddress,
  token,
  quantity,
  signOptions,
);

export const estimateTxFees: EstimateFees<TxFees> = async (
  blockchain,
  fromAddress,
  toAddress,
  token,
  quantity,
) => BLOCKCHAINS_TX_CONFIG[blockchain].estimateTxFees(
  blockchain,
  fromAddress,
  toAddress,
  token,
  quantity,
);

export const processTxToSave: ProcessTxToSave<TronWalletTx | ERC20WalletTx> = ({
  blockchain,
  ...moreConfig
}) => BLOCKCHAINS_TX_CONFIG[blockchain].processTxToSave({
  blockchain,
  ...moreConfig,
});

export const isValidAddressToSend = (Blockchain: Blockchains, address: string) => BLOCKCHAINS_TX_CONFIG[Blockchain]
  .isValidAddressToSend(address);
