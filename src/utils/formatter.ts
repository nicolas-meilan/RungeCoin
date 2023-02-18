import { BigNumber, utils } from 'ethers';
import { t } from 'i18next';

import { FIAT_DECIMALS } from './constants';
import { WALLET_ADRESS_LENGTH } from '@web3/wallet';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

type NumberToFormattedStringOptions = {
  decimals?: number;
  localize?: boolean;
  fixedDecimals?: number;
};

export const numberToFormattedString = (
  number: BigNumber | number,
  {
    decimals = 0,
    localize = true,
    fixedDecimals = 0,
  }: NumberToFormattedStringOptions = {},
): string => {
  const numberAfterFirstIteration = decimals
    ? utils.formatUnits(number, decimals)
    : number.toString();

  const numberAfterSecondIteration = fixedDecimals
    ? Number(numberAfterFirstIteration).toFixed(fixedDecimals).toString()
    : numberAfterFirstIteration;

  if (!fixedDecimals && !Number(numberAfterFirstIteration)) return '0';

  if (!localize) return numberAfterSecondIteration;

  const THROUS_SEPATATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;

  const [numberUnits, numberDecimals] = numberAfterSecondIteration.split('.');

  const formattedUnits = numberUnits.replace(THROUS_SEPATATOR_REGEX, t('number.thousandSeparator'));

  return numberDecimals
    ? [formattedUnits, numberDecimals].join(t('number.decimalSeparator') || '')
    : formattedUnits;
};

export const numberToFiatBalance = (number: BigNumber | number, symbol?: string): string => (
  `≈ **${numberToFormattedString(number, { fixedDecimals: FIAT_DECIMALS })}**${symbol ? ` ${symbol}` : ''}`
);

export const formatAddress = (adress: string) => {
  const { length } = adress;
  if (length !== WALLET_ADRESS_LENGTH) return '';

  const START_LENGTH = 6;
  const FINISH_LENGTH = 4;
  const SEPARATOR = '...';

  return [adress.slice(0, START_LENGTH), adress.slice(length - FINISH_LENGTH, length)].join(SEPARATOR);
};