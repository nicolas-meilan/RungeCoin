import React from 'react';

import type { BigNumber } from 'ethers';
import styled from 'styled-components/native';

import Icon from './Icon';
import Skeleton from './Skeleton';
import Svg from './Svg';
import Text from './Text';
import useTokenConversions from '@hooks/useTokenConversions';
import {
  numberToFormattedString,
  numberToFiatBalance,
} from '@utils/formatter';
import { TokenType } from '@web3/tokens';

type TokenItemProps = Omit<TokenType, 'address'> & {
  balance?: BigNumber;
  balanceLoading?: boolean;
  withoutMargin?: boolean;
  fullName?: boolean;
  withBorders?: boolean;
  borderColor?: string;
  rightIcon?: string;
  disabled?: boolean;
  onPress?: () => void;
};

const WrapperItem = styled.TouchableOpacity<{
  withoutMargin?: boolean;
  withBorders?: boolean;
  borderColor?: string;
  disabledStyle?: boolean;
}>`
  opacity: ${({ disabledStyle }) => (disabledStyle
    ? 0.5 : 1)};
  padding: ${({ theme }) => theme.spacing(2)};
  flex-direction: row;
  ${({ withoutMargin, theme }) => (withoutMargin
    ? ''
    : `margin-top: ${theme.spacing(2)};`
  )}
  ${({ borderColor, withBorders, theme }) => (withBorders ? `
    border: 1px solid ${borderColor || theme.colors.border};
    border-radius: ${theme.borderRadius};
    ` : ''
  )}
`;


const DataColumn = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(2)}
`;

const Title = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const Description = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const TokenIcon = styled(Svg)`
  align-self: center;
`;

const TokenItem = ({
  symbol,
  decimals,
  balance,
  svg,
  name,
  borderColor,
  rightIcon = '',
  onPress,
  disabled = false,
  balanceLoading = false,
  withoutMargin = false,
  fullName = false,
  withBorders = false,
}: TokenItemProps) => {
  const {
    convert,
    tokenConversions,
  } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const balanceFormatted = numberToFormattedString(balance || 0, { decimals });
  const balanceConverted = numberToFiatBalance(convert(balance || 0, { symbol, decimals }), 'USD');

  const dataColumn = fullName ? (
    <>
      <Title text={name} noI18n />
      <Skeleton
        isLoading={balanceLoading}
        height={15}
      >
        <Description text={`${balanceFormatted} ${symbol}`} noI18n />
        <Description text={balanceConverted} noI18n />
      </Skeleton>
    </>
  ) : (
    <>
      <Skeleton
        isLoading={balanceLoading}
        height={15}
      >
        <Title text={`${balanceFormatted} ${symbol}`} noI18n />
      </Skeleton>
      <Skeleton
        isLoading={!tokenConversions}
        height={15}
      >
        <Description text={balanceConverted} noI18n />
      </Skeleton>
    </>
  );

  return (
    <WrapperItem
      withoutMargin={withoutMargin}
      withBorders={withBorders}
      borderColor={borderColor}
      onPress={onPress}
      disabledStyle={disabled}
      disabled={disabled || !onPress}
    >
      <TokenIcon svg={svg} size={32} />
      <DataColumn>
        {dataColumn}
      </DataColumn>
      {!!rightIcon && <Icon name={rightIcon} />}
    </WrapperItem>
  );
};

export default TokenItem;
