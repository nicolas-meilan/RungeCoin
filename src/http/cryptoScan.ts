import { ETHERSCAN_API_KEY } from '@env';
import axios, { AxiosResponse } from 'axios';
import { convert } from 'ethereumjs-units';

import { isDev } from '@utils/config';

const ETHEREUM_PRODUCTION = 'https://api.etherscan.io/api';
const ETHEREUM_DEVELOPMENT = 'https://api-goerli.etherscan.io/api';

const ETHEREUM_ENDPOINT = isDev() ? ETHEREUM_DEVELOPMENT : ETHEREUM_PRODUCTION;


type GetEthersOnEthereumResponse = {
  status: string;
  message: string;
  result: string;
};

export const getEthersOnEthereum = async (address: string): Promise<string> => {
  const endpoint = `${ETHEREUM_ENDPOINT}?module=account&action=balance&tag=latest&address=${address}&apikey=${ETHERSCAN_API_KEY}`;
  const response: AxiosResponse<GetEthersOnEthereumResponse> = await axios.get(endpoint);

  return convert(response.data.result, 'wei', 'eth');
};