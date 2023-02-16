export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const START_WITH_ZEROS_REGEX = /^0*(?!\.)/;
const END_WITH_ZERO_REGEX = /\.{0,1}0*$/;

export const fromDecimalsToFullNumber = (balance: string, decimals: number): string => {
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