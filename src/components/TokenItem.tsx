import React from 'react';

import type { BigNumber } from 'ethers';
import styled from 'styled-components/native';

import Svg from './Svg';
import Text from './Text';
import useTokenConversions from '@hooks/useTokenConversions';
import {
  numberToFormattedString,
  numberToFiatBalance,
} from '@utils/formatter';
import { TokenType } from '@web3/tokens';

type TokenItemProps = Omit<TokenType, 'address' | 'name'> & {
  balance: BigNumber;
  withoutMargin?: boolean;
};

const WrapperItem = styled.View<{ withoutMargin?: boolean }>`
  padding: ${({ theme }) => theme.spacing(2)};
  ${({ withoutMargin, theme }) => (withoutMargin
    ? ''
    : `margin-top: ${theme.spacing(2)};`
  )}
  flex-direction: row;
`;

const DataColumn = styled.View`
  margin-left: ${({ theme }) => theme.spacing(2)}
`;

const TokenBalance = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const TokenConverted = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const TokenItem = ({
  symbol,
  decimals,
  balance,
  svg,
  withoutMargin = false,
}: TokenItemProps) => {
  const {
    convert,
    tokenConversionsLoading,
  } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const balanceFormatted = numberToFormattedString(balance, { decimals });
  const balanceConverted = numberToFiatBalance(convert(balance, { symbol, decimals }), 'USD');

  return (
    <WrapperItem withoutMargin={withoutMargin}>
      <Svg svg={svg} />
      <DataColumn>
        <TokenBalance text={`${balanceFormatted} ${symbol}`} noI18n />
        {tokenConversionsLoading ? (
          <></>
        ) : (
          <TokenConverted text={balanceConverted} noI18n />
        )}
      </DataColumn>
    </WrapperItem>
  );
};

export default TokenItem;
