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

export type TxInfo = {
  nonce: number;
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
  const feeData = await ethereumProvider.getFeeData();
  const nonce = await ethereumProvider.getTransactionCount(fromAddress, 'latest');
  const voidSigner = new VoidSigner(fromAddress, ethereumProvider);


  const tx: utils.Deferrable<providers.TransactionRequest> = {
    from: fromAddress,
    to: toAddress,
    gasLimit: 0,
    value: 0,
    maxFeePerGas: 0,
    maxPriorityFeePerGas: 0,
    nonce,
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
    maxFeePerGas: feeData.maxFeePerGas || BigNumber.from(0),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigNumber.from(0),
    gasPrice: feeData.gasPrice || BigNumber.from(0),
    gasUnits: gasLimit,
    totalFee: (feeData.gasPrice || BigNumber.from(0)).mul(gasLimit),
  };
};

export const send = async (
  privateKey: string,
  toAddress: string,
  token: TokenType,
  quantity: BigNumber | number | string,
): Promise<void> => {
  const wallet = new Wallet(privateKey, ethereumProvider);

  const txEstimations = await estimateTxInfo(wallet.address, toAddress, token.address);

  const gasLimit = txEstimations.gasUnits.toNumber();
  const amount = BigNumber.isBigNumber(quantity)
    ? quantity
    : utils.parseUnits(quantity.toString(), token.decimals);

  const tx: utils.Deferrable<providers.TransactionRequest> = {
    from: wallet.address,
    to: toAddress,
    value: amount,
    nonce: txEstimations.nonce,
    gasLimit,
    maxFeePerGas: txEstimations.maxFeePerGas,
    maxPriorityFeePerGas: txEstimations.maxPriorityFeePerGas,
  };

  if (token.address !== BASE_TOKEN_ADDRESS) { // is not ETH
    const txContract = new Contract(token.address, baseTokenTransferAbi, wallet);
    tx.to = token.address;
    tx.value = 0;
    tx.data = txContract.interface.encodeFunctionData('transferFrom', [wallet.address, toAddress, amount]);
  }

  wallet.sendTransaction(tx);
};