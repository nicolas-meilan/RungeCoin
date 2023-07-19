import { BigNumber, utils } from 'ethers';

import { EstimateFees, ProcessTxToSave, SendTx, TronTxFees } from './types';
import { getTronTxConfirmations } from '@http/tx/tron.tx';
import { TronWalletTx } from '@http/tx/types';
import { Blockchains } from '@web3/constants';
import { tronProvider } from '@web3/providers';
import { BASE_TOKEN_ADDRESS, TOKENS_TRON, TokenType } from '@web3/tokens';

// TODO tx type
const calculateTronTxBandwithNeeded = (tx: any) => {
  const txLength = tx.raw_data_hex.length;
  const estimateTxSignatureLength = 131;

  const fullTxLength: number = tx.signature?.reduce((acc: number, item: string) => (
    acc + item.length
  ), txLength) || txLength + estimateTxSignatureLength;

  return Math.round(fullTxLength / 2) + 68;
};

const BANDWITH_PRICE = 1000;
const ENERGY_PRICE = 420;
const ACTIVATION_FEE = 1;

const estimateTrc20TokenTxEnergyRequired = async (token: TokenType, toAddress: string) => {
  const functionSelector = 'transfer(address,uint256)';
  const contractParams = [
    { type: 'address', value: toAddress },
    { type: 'uint256', value: 1 },
  ];

  const contractConstants = await tronProvider.transactionBuilder.triggerConstantContract(
    token.address,
    functionSelector,
    {},
    contractParams,
  );

  return contractConstants.energy_used;
};

export const estimateTronFees: EstimateFees<TronTxFees> = async (
  _,
  fromAddress,
  toAddress,
  token,
  quantity = 1000,
) => {
  const isMainToken = token.address === BASE_TOKEN_ADDRESS;

  const accountResources = await tronProvider.trx.getAccountResources(fromAddress);

  const amount = BigNumber.isBigNumber(quantity)
    ? quantity
    : utils.parseUnits(quantity.toString(), token.decimals);

  let activationFee = BigNumber.from(0);
  let unsignedTx = null;
  let energyNeeded = 0;
  if (isMainToken) {
    const [
      toResources,
      newUnsignedTx,
    ] = await Promise.all([
      tronProvider.trx.getAccountResources(toAddress),
      tronProvider.transactionBuilder.sendTrx(toAddress, amount.toString(), fromAddress),
    ]);
    unsignedTx = newUnsignedTx;
    const needsDestinationAccountActivation = !Object.keys(toResources).length;
    if (needsDestinationAccountActivation) {
      activationFee = utils.parseUnits((ACTIVATION_FEE).toString(), TOKENS_TRON.TRX?.decimals);
    }
  } else {
    const functionSelector = 'transfer(address,uint256)';
    const contractParams = [
      { type: 'address', value: toAddress },
      { type: 'uint256', value: amount.toString() },
    ];

    const [
      responseContract,
      newEnergyNeeded,
    ] = await Promise.all([
      tronProvider.transactionBuilder.triggerSmartContract(
        token.address,
        functionSelector,
        {},
        contractParams,
      ),
      estimateTrc20TokenTxEnergyRequired(token, toAddress),
    ]);

    unsignedTx = responseContract.transaction;
    energyNeeded = newEnergyNeeded;
  }

  const accountEnergy = accountResources.EnergyLimit - (accountResources.EnergyUsed || 0);
  const totalBandwidth = accountResources.freeNetLimit + accountResources.NetLimit;
  const totalBandwidthUsed = (accountResources.NetUsed || 0) + (accountResources.freeNetUsed || 0);
  const accountBandwidth = totalBandwidth - totalBandwidthUsed;

  const bandwithNeeded = calculateTronTxBandwithNeeded(unsignedTx);

  const bandwithMissing = (accountBandwidth - bandwithNeeded) < 0
    ? Math.abs(accountBandwidth - bandwithNeeded)
    : 0;

  const energyMissing = (accountEnergy - energyNeeded) < 0
    ? Math.abs(accountEnergy - energyNeeded)
    : 0;

  const bandwithFee = utils.parseUnits((bandwithMissing * BANDWITH_PRICE).toString(), 0);
  const energyFee = utils.parseUnits((energyMissing * ENERGY_PRICE).toString(), 0);

  const totalFee = bandwithFee.add(energyFee).add(activationFee);

  return {
    bandwithNeeded,
    energyNeeded,
    accountEnergy,
    accountBandwidth,
    bandwithPrice: BANDWITH_PRICE,
    energyPrice: ENERGY_PRICE,
    bandwithFee,
    energyFee,
    activationFee,
    totalFee,
  };
};

export const tronSend: SendTx<TronWalletTx> = async (
  _,
  fromAddress,
  toAddress,
  token,
  quantity,
  {
    //  isHw,
    //  hwBluetooth,
    privateKey,
  } = {
    isHw: false,
    hwBluetooth: false,
    privateKey: '',
  },
) => {
  const amount = BigNumber.isBigNumber(quantity)
    ? quantity
    : utils.parseUnits(quantity.toString(), token.decimals);

  let unsignedTx = null;
  if (token.address === BASE_TOKEN_ADDRESS) {
    unsignedTx = await tronProvider.transactionBuilder.sendTrx(toAddress, amount.toString(), fromAddress);
  } else {
    const functionSelector = 'transfer(address,uint256)';
    const parameter = [
      { type: 'address', value: toAddress },
      { type: 'uint256', value: amount.toString() },
    ];

    const estimatedContractEnergy = await estimateTrc20TokenTxEnergyRequired(token, toAddress);
    
    const contractOptions = {
      feeLimit: estimatedContractEnergy * ENERGY_PRICE,
    };

    unsignedTx = (await tronProvider.transactionBuilder
      .triggerSmartContract(token.address, functionSelector, contractOptions, parameter)).transaction;
  }

  // if (isHw) { //TODO HW
  //   console.log('TODO TRON HW');
  //   console.log({ hwBluetooth });

  //   return 'TODO HW';
  // }

  const signedTx = await tronProvider.trx.sign(unsignedTx, privateKey);

  const response = await tronProvider.trx.sendRawTransaction(signedTx);

  const timeStampMs = response.transaction.raw_data.timestamp.toString();
  const timeStamp = timeStampMs.slice(0, timeStampMs.length - 3);

  const formattedTx: TronWalletTx = {
    blockchain: Blockchains.TRON,
    confirmations: 0,
    contractAddress: token.address,
    from: fromAddress,
    hash: response.transaction.txID,
    isError: !response.result,
    timeStamp,
    to: toAddress,
    value: amount.toString(),
    bandwith: 0,
    energy: 0,
  };

  return {
    hash: formattedTx.hash,
    tx: formattedTx,
  };
};

export const tronProcessTxToSave: ProcessTxToSave<TronWalletTx> = async ({ tx, needsUpdate }) => {

  let confirmations = 0;
  try {
    if (needsUpdate && tx) {
      confirmations = await getTronTxConfirmations(tx.hash);
    }
  } catch (error) { }

  const tronTx = tx ? {
    ...tx,
    confirmations,
  } as TronWalletTx : null;

  return tronTx;
};

export const tronIsValidAddressToSend = (address: string) => tronProvider.isAddress(address);