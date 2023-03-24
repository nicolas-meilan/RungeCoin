import { HTTP_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY } from '@env';
import axios from 'axios';
import { BigNumber } from 'ethers';

import { isDev } from '@utils/config';
import { BASE_TOKEN_ADDRESS } from '@web3/tokens';

const ETH_URL = isDev()
  ? 'https://api-goerli.etherscan.io/api'
  : 'https://api.etherscan.io/api';

export const TX_URL = isDev()
  ? 'https://goerli.etherscan.io/tx/'
  : 'https://etherscan.io/tx/';

export type WalletTx = {
  confirmations: number;
  contractAddress: string;
  from: string;
  gasPrice: BigNumber;
  gasUsed: number;
  hash: string;
  isError: boolean;
  timeStamp: string;
  to: string;
  value: BigNumber;
};

export type WalletTxResponse = Omit<WalletTx, 'value' | 'isError' | 'confirmations' | 'gasPrice' | 'gasUsed'> & {
  isError: string;
  confirmations: string;
  gasPrice: string;
  gasUsed: string;
  value: string;
};

export const getWalletTxs = async (
  address: string,
  tokenAddress: string,
  {
    page,
    offset,
  }: {
    page?: number;
    offset?: number;
  } = {
    page: 1,
    offset: 15,
  },
): Promise<WalletTx[]> => {
  const isBaseToken = tokenAddress === BASE_TOKEN_ADDRESS;
  const action = isBaseToken ? 'txlist' : 'tokentx';
  const contractAddress = isBaseToken ? '' : `&contractAddress=${tokenAddress}`;
  const url = `${ETH_URL}\
?module=account\
&action=${action}\
${contractAddress}\
&sort=desc&address=${address}\
&page=${page}\
&offset=${offset}\
&apikey=${HTTP_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY}`;

  const response = await axios.get<{ result: WalletTxResponse[] }>(url);

  const formattedResponse = response.data.result.map((item) => ({
    confirmations: Number(item.confirmations),
    contractAddress: item.contractAddress,
    from: item.from,
    gasPrice: BigNumber.from(item.gasPrice),
    gasUsed: Number(item.gasUsed),
    hash: item.hash,
    isError: !!Number(item.isError),
    timeStamp: item.timeStamp,
    to: item.to,
    value: BigNumber.from(item.value),
  }));

  return formattedResponse;
};
