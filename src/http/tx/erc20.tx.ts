import {
  HTTP_ETH_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
  HTTP_POLYGON_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
  HTTP_BSC_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
} from '@env';
import axios from 'axios';

import { ERC20WalletTx, GetWalletTxs } from './types';
import { isDev } from '@utils/config';
import { Blockchains } from '@web3/constants';
import { BASE_TOKEN_ADDRESS } from '@web3/tokens';


const ERC20_API_CONFIG = {
  [Blockchains.ETHEREUM]: {
    url: isDev()
      ? 'https://api-sepolia.etherscan.io/api'
      : 'https://api.etherscan.io/api',
    apiKey: HTTP_ETH_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
  }, [Blockchains.POLYGON]: {
    url: 'https://api.polygonscan.com/api',
    apiKey: HTTP_POLYGON_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
  }, [Blockchains.BSC]: {
    url: 'https://api.bscscan.com/api',
    apiKey: HTTP_BSC_BLOCKCHAIN_INFO_PROVIDER_VENDOR_KEY,
  },
};

export const ERC20_TX_URL = {
  [Blockchains.ETHEREUM]: isDev()
    ? 'https://sepolia.etherscan.io/tx/'
    : 'https://etherscan.io/tx/',
  [Blockchains.POLYGON]: 'https://polygonscan.com/tx/',
  [Blockchains.BSC]: 'https://bscscan.com/tx/',
};

type ERC20WalletTxResponse = Omit<ERC20WalletTx, 'isError' | 'confirmations' | 'gasUsed'> & {
  isError: string;
  confirmations: string;
  gasUsed: string;
};


export const getERC20WalletTxs: GetWalletTxs<ERC20WalletTx> = async (
  address,
  tokenAddress,
  blockchain,
  {
    page,
    offset,
  } = {
    page: 1,
    offset: 15,
  },
) => {
  const isBaseToken = tokenAddress === BASE_TOKEN_ADDRESS;
  const action = isBaseToken ? 'txlist' : 'tokentx';
  const contractAddress = isBaseToken ? '' : `&contractAddress=${tokenAddress}`;
  const apiConfig = ERC20_API_CONFIG[blockchain as keyof typeof ERC20_API_CONFIG];

  const url = `${apiConfig.url}\
?module=account\
&action=${action}\
${contractAddress}\
&sort=desc\
&address=${address}\
&page=${page}\
&offset=${offset}\
&apikey=${apiConfig.apiKey}`;

  const response = await axios.get<{ result: ERC20WalletTxResponse[] }>(url);

  const formattedResponse = response.data.result.map((item) => ({
    blockchain,
    confirmations: Number(item.confirmations),
    contractAddress: item.contractAddress,
    from: item.from,
    gasPrice: item.gasPrice,
    gasUsed: Number(item.gasUsed),
    hash: item.hash,
    isError: !!Number(item.isError),
    timeStamp: item.timeStamp,
    to: item.to,
    value: item.value,
  }));

  return formattedResponse;
};
