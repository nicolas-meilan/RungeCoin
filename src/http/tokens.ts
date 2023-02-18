import axios from 'axios';

import { FiatCurrencies } from '@utils/constants';
import { TokenSymbol } from '@web3/tokens';

const PRICES_URL = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms={{FROM}}&tsyms={{TO}}';

export type TokenConversionsEndpointResponse = {
  data: {
    [token in TokenSymbol]: {
      [currency in FiatCurrencies]: number;
    }
  };
};

export const getTokenConversions = async () => {
  const cryptoTokens = Object.values(TokenSymbol).join(',');
  const path = PRICES_URL
    .replace('{{FROM}}', cryptoTokens)
    .replace('{{TO}}', `${cryptoTokens},${Object.values(FiatCurrencies).join(',')}`);

  const result: TokenConversionsEndpointResponse = await axios.get(path);

  return result.data;
};