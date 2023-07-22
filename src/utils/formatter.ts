import { BigNumber, utils } from 'ethers';
import { t } from 'i18next';

import { FIAT_DECIMALS } from './constants';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
export const INPUT_NUMBER = /^(\d)*.?(\d)*$/;

type NumberToFormattedStringOptions = {
  decimals?: number | string;
  localize?: boolean;
  fixedDecimals?: number;
};

export const localizeNumber = (number: string): string => {
  const THROUSAND_SEPATATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;
  const INVALID_UNIT_ZEROS_REGEX = /^0*/;

  const [numberUnits, numberDecimals] = number.split('.');

  const formattedUnits = numberUnits
    .replace(INVALID_UNIT_ZEROS_REGEX, '')
    .replace(THROUSAND_SEPATATOR_REGEX, t('number.thousandSeparator')) || '0';

  return numberDecimals
    ? [formattedUnits, numberDecimals].join(t('number.decimalSeparator') || '')
    : formattedUnits;
};

export const numberToFormattedString = (
  number: BigNumber | number | string,
  {
    decimals = 0,
    localize = true,
    fixedDecimals = 0,
  }: NumberToFormattedStringOptions = {},
): string => {
  const baseFormattedNumber = decimals
    ? utils.formatUnits(number, decimals)
    : number.toString();

  const splittedNumber = baseFormattedNumber.split('.');
  const numberAfterFirstIteration = Number(splittedNumber[1]) === 0 ? splittedNumber[0] : baseFormattedNumber;

  const numberAfterSecondIteration = fixedDecimals
    ? Number(numberAfterFirstIteration).toFixed(fixedDecimals).toString()
    : numberAfterFirstIteration;

  if (!fixedDecimals && !Number(numberAfterFirstIteration)) return '0';

  if (!localize) return numberAfterSecondIteration;

  return localize ? localizeNumber(numberAfterSecondIteration) : numberAfterSecondIteration;
};

export const numberToFiatBalance = (
  number: BigNumber | number,
  symbol?: string,
): string => (
  `≈ ${numberToFormattedString(number, { fixedDecimals: FIAT_DECIMALS })}${symbol ? ` ${symbol}` : ''}`
);

export const formatAddress = (address: string) => {
  const { length } = address;

  const START_LENGTH = 6;
  const FINISH_LENGTH = 4;
  const SEPARATOR = '...';

  return [address.slice(0, START_LENGTH), address.slice(length - FINISH_LENGTH, length)].join(SEPARATOR);
};