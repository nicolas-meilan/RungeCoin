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

import { Blockchains } from './constants';
import getProvider from './providers';
import { BASE_TOKENS_TRANSFER_ABI } from './smartContracts';
import { BASE_TOKEN_ADDRESS, TokenType } from './tokens';
import {
  connectHw,
  BASE_ADDRESS_INDEX,
  ETH_DERIVATION_PATH,
} from './wallet';

export type TxInfo = {
  nonce: number;
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

  const [
    feeData,
    nonce,
    { chainId },
  ] = await Promise.all([
    provider.getFeeData(),
    provider.getTransactionCount(fromAddress, 'latest'),
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
    nonce,
    chainId,
  };

  let gasLimitTolerance = 1;
  if (tokenAddress !== BASE_TOKEN_ADDRESS) { // is not ETH
    const txContract = new Contract(tokenAddress, BASE_TOKENS_TRANSFER_ABI, voidSigner);
    tx.data = txContract.interface.encodeFunctionData('transferFrom', [fromAddress, toAddress, 0]);
    tx.to = tokenAddress;
    gasLimitTolerance = 2; // the gas limit estimated for a smart contract can be unexacted.
  } 


  const gasLimit = (await voidSigner.estimateGas(tx)).mul(gasLimitTolerance);

  return {
    nonce,
    chainId,
    maxFeePerGas: feeData.maxFeePerGas || BigNumber.from(0),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigNumber.from(0),
    gasPrice: feeData.gasPrice || BigNumber.from(0),
    gasUnits: gasLimit,
    totalFee: (feeData.gasPrice || BigNumber.from(0)).mul(gasLimit),
  };
};

export const INVALID_SIGN_INFORMATION = 'INVALID_SIGN_INFORMATION';
export const NO_TX_TO_SIGN = 'NO_TX_TO_SIGN';

type SignedTx = {
  s: string;
  v: string;
  r: string;
};

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
  const resolution = await ledgerService.resolveTransaction(tx, {}, { erc20: true });
  const signedTx: SignedTx = await eth.signTransaction(derivationPath, tx, resolution);
  transport.close();

  return {
    v: Number(signedTx.v),
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
): Promise<void> => {
  const provider = getProvider(blockchain);

  if (!privateKey && !isHw) throw new Error(INVALID_SIGN_INFORMATION);

  const txEstimations = await estimateTxInfo(blockchain, fromAddress, toAddress, token.address);

  const gasLimit = txEstimations.gasUnits.toNumber();
  const amount = BigNumber.isBigNumber(quantity)
    ? quantity
    : utils.parseUnits(quantity.toString(), token.decimals);

  const tx: Omit<utils.Deferrable<providers.TransactionRequest>, 'nonce'> & {
    nonce: number;
  } = {
    from: fromAddress,
    to: toAddress,
    value: amount,
    nonce: txEstimations.nonce,
    chainId: txEstimations.chainId,
    gasLimit,
    type: 2,
    maxFeePerGas: txEstimations.maxFeePerGas,
    maxPriorityFeePerGas: txEstimations.maxPriorityFeePerGas,
  };

  if (token.address !== BASE_TOKEN_ADDRESS) { // is not ETH
    const txContract = new Contract(token.address, BASE_TOKENS_TRANSFER_ABI);
    tx.to = token.address;
    tx.value = 0;
    tx.data = txContract.interface.encodeFunctionData('transferFrom', [fromAddress, toAddress, amount]);
  }
  if (isHw) {
    const { from, ...txToResolveProperties } = tx;
    const txToSerialize = await utils.resolveProperties(txToResolveProperties);
    const unsignedTx = utils.serializeTransaction(txToSerialize).substring(2);

    const signedTx = await signTxWithLedger({
      bluetoothConnection: hwBluetooth,
      tx: unsignedTx,
    });

    await provider.sendTransaction(utils.serializeTransaction(txToSerialize, signedTx));
    return;
  }
  const wallet = new Wallet(privateKey!, provider);
  wallet.sendTransaction(tx);
};