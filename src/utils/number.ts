export const isBigInt = (value: any) => typeof value === 'bigint';

export const toBigInt = (number: bigint | number | string = 0) => (
  isBigInt(number)
    ? number as bigint
    : BigInt(number)
);

export const isZero = (number: bigint | number | string = 0) => toBigInt(number) === 0n;
