import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import {
  Contract,
  VoidSigner,
  Wallet,
  Provider,
  TransactionRequest,
  parseUnits,
  resolveProperties,
  Transaction,
  isAddress,
  SignatureLike,
} from 'ethers';

import { ERC20TxFees, EstimateFees, NO_TX_TO_SIGN_ERROR, ProcessTxToSave, SendTx } from './types';
import { ERC20WalletTx } from '@http/tx/types';
import { isBigInt } from '@utils/number';
import { BLOCKCHAINS_CONFIG, Blockchains } from '@web3/constants';
import getProvider from '@web3/providers';
import { BASE_TOKENS_TRANSFER_ABI } from '@web3/smartContracts';
import { BASE_TOKEN_ADDRESS } from '@web3/tokens';
import { BASE_ADDRESS_INDEX, connectHw, getDerivationPath } from '@web3/wallet';


export type TxInfo = {
  chainId: number;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
  gasUnits: bigint;
  totalFee: bigint;
};

const CONTRACT_TRANSFER_METHOD = 'transfer';

const estimateErc20TxInfo: EstimateFees<ERC20TxFees & {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  chainId: number;
}> = async (
  blockchain,
  fromAddress,
  toAddress,
  token,
): Promise<TxInfo> => {
  const provider = getProvider(blockchain) as Provider;
  const blockchainConfig = BLOCKCHAINS_CONFIG[blockchain];

  const [
    feeData,
    { chainId },
  ] = await Promise.all([
    provider.getFeeData(),
    provider.getNetwork(),
  ]);

  const voidSigner = new VoidSigner(fromAddress, provider);

  const tx: TransactionRequest = {
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

  if (token.address !== BASE_TOKEN_ADDRESS) { // is not a native token
    const txContract = new Contract(token.address, BASE_TOKENS_TRANSFER_ABI, voidSigner);
    tx.data = txContract.interface.encodeFunctionData(CONTRACT_TRANSFER_METHOD, [toAddress, 0]);
    tx.to = token.address;
    gasLimitTolerance = 2; // the gas limit estimated for a smart contract can be unexacted.
  }

  const gasLimit = (await voidSigner.estimateGas(tx))
    * (parseUnits(gasLimitTolerance.toString(), offsetDecimals))
    / (BigInt(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const maxFeePerGas = (feeData.maxFeePerGas || feeData.gasPrice || 0n)
    * (parseUnits(feePerGasOffset.toString(), offsetDecimals))
    / (BigInt(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas || feeData.gasPrice || 0n)
    * (parseUnits(feePerGasOffset.toString(), offsetDecimals))
    / (BigInt(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const gasPrice = (feeData.gasPrice || 0n)
    * (parseUnits(feePerGasOffset.toString(), offsetDecimals))
    / (BigInt(`1${new Array(offsetDecimals).fill(0).join('')}`));

  const totalFee = (blockchainConfig.hasMaxFeePerGas
    ? maxFeePerGas
    : gasPrice
  ) * gasLimit;

  return {
    chainId: Number(chainId),
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    totalFee,
    gasUnits: gasLimit,
  };
};

export const estimateErc20TxFees: EstimateFees<ERC20TxFees> = estimateErc20TxInfo;

export const INVALID_SIGN_INFORMATION = 'INVALID_SIGN_INFORMATION';

type SignedTx = {
  s: string;
  v: string;
  r: string;
};

// https://github.com/ethers-io/ethers-ledger/blob/master/src.ts/index.ts#L67
export const erc20SignTxWithLedger = async (
  blockchain: Blockchains,
  {
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
  if (!tx) throw new Error(NO_TX_TO_SIGN_ERROR);

  const walletIndex = (index || BASE_ADDRESS_INDEX) > 0 ? index : 0;
  const derivationPath = `${getDerivationPath(blockchain)}/${walletIndex}`;
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

export const erc20send: SendTx<undefined> = async (
  blockchain,
  fromAddress,
  toAddress,
  token,
  quantity,
  {
    isHw,
    hwBluetooth,
    privateKey,
  } = {
    isHw: false,
    hwBluetooth: false,
    privateKey: '',
  },
) => {
  const provider = getProvider(blockchain) as Provider;

  const blockchainConfig = BLOCKCHAINS_CONFIG[blockchain];

  if (!privateKey && !isHw) throw new Error(INVALID_SIGN_INFORMATION);

  const [
    txEstimations,
    nonce,
  ] = await Promise.all([
    estimateErc20TxInfo(blockchain, fromAddress, toAddress, token),
    provider.getTransactionCount(fromAddress, 'pending'),
  ]);

  const gasLimit = Number(txEstimations.gasUnits);
  const amount = isBigInt(quantity)
    ? quantity
    : parseUnits(quantity.toString(), token.decimals);

  const txFees = blockchainConfig.hasMaxFeePerGas ? {
    maxFeePerGas: txEstimations.maxFeePerGas,
    maxPriorityFeePerGas: txEstimations.maxPriorityFeePerGas,
    type: 2,
  } : {
    gasPrice: txEstimations.gasPrice,
  };

  const tx: Omit<TransactionRequest, 'nonce' | 'to'> & {
    nonce: number;
    to: string;
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
    tx.data = txContract.interface.encodeFunctionData(CONTRACT_TRANSFER_METHOD, [toAddress, amount]);
  }
  if (isHw) {
    const { from, ...txToResolveProperties } = tx;
    const txToSerialize = await resolveProperties(txToResolveProperties);
    const unsignedTx = Transaction.from(txToSerialize).unsignedSerialized.substring(2);

    const sig = await erc20SignTxWithLedger(blockchain, {
      bluetoothConnection: hwBluetooth,
      tx: unsignedTx,
    });

    const serializedTx = Transaction.from({
      ...txToSerialize,
      signature: sig,
    }).serialized;

    const { hash } = await provider.broadcastTransaction(serializedTx);

    return { hash };
  }
  const wallet = new Wallet(privateKey!, provider);
  const { hash } = await wallet.sendTransaction(tx);

  return { hash };
};

export const erc20ProcessTxToSave: ProcessTxToSave<ERC20WalletTx> = async ({ hash, blockchain }) => {
  const provider = getProvider(blockchain) as Provider;

  const txData = await provider.getTransaction(hash);

  if (!txData) return null;

  const confirmations = await txData.confirmations();

  const walletTx = {
    blockchain,
    confirmations,
    contractAddress: BASE_TOKEN_ADDRESS,
    from: txData.from,
    to: txData.to || '',
    gasPrice: (txData.gasPrice || txData.maxFeePerGas || 0n).toString(),
    hash: txData.hash,
    isError: false,
    timeStamp: (new Date()).getTime().toString(),
    value: (txData.value).toString(),
    gasUsed: Number(txData.gasLimit),
  };

  const voidData = '0x';
  if (!txData.data || txData.data === voidData) return walletTx;

  const txContract = new Contract(txData.to || '', BASE_TOKENS_TRANSFER_ABI);
  const decodedTxData = txContract.interface
    .decodeFunctionData(CONTRACT_TRANSFER_METHOD, txData.data) as unknown as [string, string, BigInt];

  walletTx.value = decodedTxData[2].toString();
  walletTx.to = decodedTxData[1];

  walletTx.contractAddress = txData.to || '';

  return walletTx;
};

export const erc20IsValidAddressToSend = (address: string) => isAddress(address);
