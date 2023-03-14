import { BigNumber, utils } from 'ethers';

export const bigNumberMulNumber = (number: BigNumber, mul: number, decimals: number): number => {
  try {
    return number.mul(mul).toNumber();

  } catch (error) {
    const balanceNormalNumber = Number(utils.formatUnits(number, decimals));

    return balanceNormalNumber * mul;
  }
};
