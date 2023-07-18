import {
  HTTP_TRON_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
} from '@env';
import axios from 'axios';

import { GetWalletTxs, TronWalletTx } from './types';
import { isDev } from '@utils/config';
import { Blockchains } from '@web3/constants';
import { BASE_TOKEN_ADDRESS } from '@web3/tokens';

const TRON_TX_API = {
  url: isDev()
    ? 'https://nileapi.tronscan.org/api'
    : 'https://apilist.tronscanapi.com/api',
  apiKey: HTTP_TRON_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
};

export const TRON_TX_URL = isDev()
  ? 'https://nile.tronscan.org/#/transaction/'
  : 'https://tronscan.org/#/transaction/';

export type WalletTx = {
  blockchain: Blockchains;
  confirmations: number;
  contractAddress: string;
  from: string;
  gasPrice: string;
  gasUsed: number;
  hash: string;
  isError: boolean;
  timeStamp: string;
  to: string;
  value: string;
};

type TronWalletTxResponse = {
  confirmed: number;
  from: string;
  to: string;
  hash: string;
  block_timestamp: string;
  amount: string;
  contract_ret: 'SUCCESS' | string;
};

export const getTronWalletTxs: GetWalletTxs<TronWalletTx> = async (
  address: string,
  tokenAddress: string,
  _: Blockchains,
  {
    page,
    offset,
  } = {
    page: 1,
    offset: 15,
  },
) => {
  const isBaseToken = tokenAddress === BASE_TOKEN_ADDRESS;
  const action = isBaseToken ? 'trx' : 'trc20';
  const contractAddress = isBaseToken ? '' : `&trc20Id=${tokenAddress}`;

  const startIndex = offset * (page - 1);
  const limit = offset * page;

  const url = `${TRON_TX_API.url}/transfer\
/${action}\
?address=${address}\
&limit=${limit}\
&start=${startIndex}\
${contractAddress}
`;

  const response = await axios.get<{ data: TronWalletTxResponse[] }>(url, {
    headers: {
      'TRON-PRO-API-KEY': TRON_TX_API.apiKey,
    },
  });

  const formattedResponse = response.data.data.map((item) => {
    const timeStampMs = item.block_timestamp.toString();
    const timeStamp = timeStampMs.slice(0, timeStampMs.length - 3);

    return {
      blockchain: Blockchains.TRON as Blockchains.TRON,
      confirmations: item.confirmed,
      contractAddress: tokenAddress,
      from: item.from,
      bandwith: 0,
      energy: 0,
      hash: item.hash,
      isError: item.contract_ret !== 'SUCCESS',
      timeStamp,
      to: item.to,
      value: item.amount,
    };
  });

  return formattedResponse;
};

export const getTronTxConfirmations = async (hash: string) => {
  const url = `${TRON_TX_API.url}/transaction-info?hash=${hash}`;

  const response = await axios.get<{ confirmations: number }>(url, {
    headers: {
      'TRON-PRO-API-KEY': TRON_TX_API.apiKey,
    },
  });

  return response.data.confirmations;
};
