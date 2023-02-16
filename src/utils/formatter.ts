import type { BigNumber } from 'ethers';
import { t } from 'i18next';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const START_WITH_ZEROS_REGEX = /^0*(?!\.)/;
const END_WITH_ZERO_REGEX = /\.{0,1}0*$/;
const THROUS_SEPATATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;

const baseBigNumberStringFormatter = (balance: string, decimals: number): string => {
  const numberLengthDiff = balance.length - decimals;

  let strBalance = '';
  if (!numberLengthDiff) strBalance = `0.${balance}`;

  if (numberLengthDiff > 0) {
    strBalance = [balance.slice(0, numberLengthDiff), balance.slice(numberLengthDiff)].join('.');
  } else {
    strBalance = `0.${''.padStart(Math.abs(numberLengthDiff), '0')}${balance}`;
  }

  return strBalance.replace(START_WITH_ZEROS_REGEX, '').replace(END_WITH_ZERO_REGEX, '') || '0';
};

export const bigNumberToFormattedString = (number: BigNumber, decimals: number): string => {
  const numberAfterFirstIteration = baseBigNumberStringFormatter(number.toString(), decimals);

  const [numberUnits, numberDecimals] = numberAfterFirstIteration.split('.');

  const formattedUnits = numberUnits.replace(THROUS_SEPATATOR_REGEX, t('number.thousandSeparator'));


  return numberDecimals
    ? [formattedUnits, numberDecimals].join(t('number.decimalSeparator') || '')
    : formattedUnits;
};
