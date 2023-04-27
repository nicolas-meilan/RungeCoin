import type { SignatureLike } from '@ethersproject/bytes';
import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import {
  BigNumber,
  Contract,
  utils,
  VoidSigner,
  Wallet,
  providers,
} from 'ethers';

import { BLOCKCHAINS_CONFIG, Blockchains } from './constants';
import getProvider from './providers';
import { BASE_TOKENS_TRANSFER_ABI } from './smartContracts';
import { BASE_TOKEN_ADDRESS, TokenType } from './tokens';
import {
  connectHw,
  BASE_ADDRESS_INDEX,
  ETH_DERIVATION_PATH,
} from './wallet';

export type TxInfo = {
  chainId: number;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  gasPrice: BigNumber;
  gasUnits: BigNumber;
  totalFee: BigNumber;
};

export const estimateTxInfo = async (
  blockchain: Blockchains,
  fromAddress: string,
  toAddress: string,
  tokenAddress: string,
): Promise<TxInfo> => {
  const provider = getProvider(blockchain);
  const blockchainConfig = BLOCKCHAINS_CONFIG[blockchain];

  const [
    feeData,
    { chainId },
  ] = await Promise.all([
    provider.getFeeData(),
    provider.getNetwork(),
  ]);

  const voidSigner = new VoidSigner(fromAddress, provider);

  const tx: utils.Deferrable<providers.TransactionRequest> = {
    from: fromAddress,
    to: toAddress,
    gasLimit: 0,
    value: 0,
    maxFeePerGas: 0,
    maxPriorityFeePerGas: 0,
    chainId,
  };

  const offsetDecimals = 2;
  const feePerGasOffset = 1;
  let gasLimitTolerance = 1;

  if (tokenAddress !== BASE_TOKEN_ADDRESS) { // is not ETH
    const txContract = new Contract(tokenAddress, BASE_TOKENS_TRANSFER_ABI, voidSigner);
    tx.data = txContract.interface.encodeFunctionData('transferFrom', [fromAddress, toAddress, 0]);
    tx.to = tokenAddress;
    gasLimitTolerance = 2; // the gas limit estimated for a smart contract can be unexacted.
  }

  const gasLimit = (await voidSigner.estimateGas(tx))
    .mul(utils.parseUnits(gasLimitTolerance.toString(), offsetDecimals))
    .div(BigNumber.from(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const maxFeePerGas = (feeData.maxFeePerGas || feeData.gasPrice || BigNumber.from(0))
    .mul(utils.parseUnits(feePerGasOffset.toString(), offsetDecimals))
    .div(BigNumber.from(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas || feeData.gasPrice || BigNumber.from(0))
    .mul(utils.parseUnits(feePerGasOffset.toString(), offsetDecimals))
    .div(BigNumber.from(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const gasPrice = (feeData.gasPrice || BigNumber.from(0))
    .mul(utils.parseUnits(feePerGasOffset.toString(), offsetDecimals))
    .div(BigNumber.from(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const totalFee = (blockchainConfig.hasMaxFeePerGas
    ? maxFeePerGas
    : gasPrice
  ).mul(gasLimit);

  return {
    chainId,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    totalFee,
    gasUnits: gasLimit,
  };
};

export const INVALID_SIGN_INFORMATION = 'INVALID_SIGN_INFORMATION';
export const NO_TX_TO_SIGN = 'NO_TX_TO_SIGN';

type SignedTx = {
  s: string;
  v: string;
  r: string;
};

// https://github.com/ethers-io/ethers-ledger/blob/master/src.ts/index.ts#L67
const signTxWithLedger = async ({
  index,
  bluetoothConnection,
  tx,
}: {
  index?: number;
  bluetoothConnection?: boolean;
  tx: string;
} = {
  index: BASE_ADDRESS_INDEX,
  bluetoothConnection: false,
  tx: '',
}): Promise<SignatureLike> => {
  if (!tx) throw new Error(NO_TX_TO_SIGN);

  const walletIndex = (index || BASE_ADDRESS_INDEX) > 0 ? index : 0;
  const derivationPath = `${ETH_DERIVATION_PATH}/${walletIndex}`;
  const transport = await connectHw(bluetoothConnection);

  const eth = new AppEth(transport);
  const resolution = await ledgerService.resolveTransaction(tx, {}, {});
  const signedTx: SignedTx = await eth.signTransaction(derivationPath, tx, resolution);
  transport.close();

  
  return {
    v: parseInt(`0x${signedTx.v}`, 16),
    r: `0x${signedTx.r}`,
    s: `0x${signedTx.s}`,
  };
};

type SignOptions = {
  privateKey?: string | null;
  isHw?: boolean;
  hwBluetooth?: boolean;
};

export const send = async (
  blockchain: Blockchains,
  fromAddress: string,
  toAddress: string,
  token: TokenType,
  quantity: BigNumber | number | string,
  {
    isHw,
    hwBluetooth,
    privateKey,
  }: SignOptions = {
    isHw: false,
    hwBluetooth: false,
    privateKey: '',
  },
): Promise<string> => {
  const provider = getProvider(blockchain);

  const blockchainConfig = BLOCKCHAINS_CONFIG[blockchain];

  if (!privateKey && !isHw) throw new Error(INVALID_SIGN_INFORMATION);

  const [
    txEstimations,
    nonce,
  ] = await Promise.all([
    estimateTxInfo(blockchain, fromAddress, toAddress, token.address),
    provider.getTransactionCount(fromAddress, 'pending'),
  ]);

  const gasLimit = txEstimations.gasUnits.toNumber();
  const amount = BigNumber.isBigNumber(quantity)
    ? quantity
    : utils.parseUnits(quantity.toString(), token.decimals);

  const txFees = blockchainConfig.hasMaxFeePerGas ? {
    maxFeePerGas: txEstimations.maxFeePerGas,
    maxPriorityFeePerGas: txEstimations.maxPriorityFeePerGas,
    type: 2,
  } : {
    gasPrice: txEstimations.gasPrice,
  };

  const tx: Omit<utils.Deferrable<providers.TransactionRequest>, 'nonce'> & {
    nonce: number;
  } = {
    from: fromAddress,
    to: toAddress,
    value: amount,
    nonce,
    chainId: txEstimations.chainId,
    gasLimit,
    ...txFees,
  };

  if (token.address !== BASE_TOKEN_ADDRESS) { // is not native token
    const txContract = new Contract(token.address, BASE_TOKENS_TRANSFER_ABI);
    tx.to = token.address;
    tx.value = 0;
    tx.data = txContract.interface.encodeFunctionData('transferFrom', [fromAddress, toAddress, amount]);
  }
  if (isHw) {
    const { from, ...txToResolveProperties } = tx;
    const txToSerialize = await utils.resolveProperties(txToResolveProperties);
    const unsignedTx = utils.serializeTransaction(txToSerialize).substring(2);

    const sig = await signTxWithLedger({
      bluetoothConnection: hwBluetooth,
      tx: unsignedTx,
    });

    const { hash } = await provider.sendTransaction(utils.serializeTransaction(txToSerialize, sig));

    return hash;
  }
  const wallet = new Wallet(privateKey!, provider);
  const { hash } = await wallet.sendTransaction(tx);

  return hash;
};