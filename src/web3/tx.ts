import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import TransportHID from '@ledgerhq/react-native-hid';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { SignatureLike } from '@ethersproject/bytes';
import {
  BigNumber,
  Contract,
  utils,
  VoidSigner,
  Wallet,
  providers,
} from 'ethers';

import { ethereumProvider } from './providers';
import { baseTokenTransferAbi } from './smartContracts';
import { BASE_TOKEN_ADDRESS, TokenType } from './tokens';
import {
  BASE_ADDRESS_INDEX,
  ETH_DERIVATION_PATH,
  getBluetoothHw,
  NO_LEDGER_CONNECTED_ERROR,
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
  fromAddress: string,
  toAddress: string,
  tokenAddress: string,
): Promise<TxInfo> => {
  const [
    feeData,
    nonce,
    { chainId },
  ] = await Promise.all([
    ethereumProvider.getFeeData(),
    ethereumProvider.getTransactionCount(fromAddress, 'latest'),
    ethereumProvider.getNetwork(),
  ]);

  const voidSigner = new VoidSigner(fromAddress, ethereumProvider);

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
    const txContract = new Contract(tokenAddress, baseTokenTransferAbi, voidSigner);
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
  if (!privateKey && !isHw) throw new Error(INVALID_SIGN_INFORMATION);

  const txEstimations = await estimateTxInfo(fromAddress, toAddress, token.address);

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
    const txContract = new Contract(token.address, baseTokenTransferAbi);
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

    await ethereumProvider.sendTransaction(utils.serializeTransaction(txToSerialize, signedTx));
    return;
  }
  const wallet = new Wallet(privateKey!, ethereumProvider);
  wallet.sendTransaction(tx);
};