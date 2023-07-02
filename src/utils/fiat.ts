import { FiatCurrencies } from './constants';

const FIAT_REPLACER = '{{fiat}}';
const FIAT_BASE_URL = `https://s3-symbol-logo.tradingview.com/country/${FIAT_REPLACER}--big.svg`;

export const getFiatIconUrl = (fiatCurrency: FiatCurrencies) => {
  const fiatWorkaround = fiatCurrency.slice(0, 2);

  return FIAT_BASE_URL.replace(FIAT_REPLACER, fiatWorkaround);
};
