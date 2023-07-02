import React, { useState } from 'react';

import styled from 'styled-components/native';

import Svg, { SvgProps } from './Svg';
import defaultTokenIcon from '@assets/defaultTokenIcon.svg';
import {
  TOKEN_ICON_URL,
  TOKEN_ICON_URL_REPLACER,
} from '@http/tokens';
import { FiatCurrencies } from '@utils/constants';
import { getFiatIconUrl } from '@utils/fiat';
import type { TokenType } from '@web3/tokens';

type TokenStatus = 'success' | 'warning' | 'error';

export type TokenIconProps = SvgProps & {
  tokenSymbol: TokenType['symbol'] | FiatCurrencies;
  isFiat?: boolean;
  status?: TokenStatus;
};

const StyledSvg = styled(Svg) <{ status?: TokenStatus }>`
  border-radius: 2000px;
  overflow: hidden;
  border: ${({ status, theme }) => (status ? theme.spacing(2) : '1px')} solid;
  border-color: ${({ status, theme }) => (status
    ? theme.colors[status]
    : theme.colors.border
  )};
  background-color: ${({ theme }) => theme.colors.border};
`;

const TokenIcon = ({
  status,
  tokenSymbol,
  isFiat = false,
  ...props
}: TokenIconProps) => {
  const [hasError, setHasError] = useState(false);

  const onError = () => setHasError(true);

  const svg = hasError ? defaultTokenIcon : null;

  const iconUrl = isFiat
    ? getFiatIconUrl(tokenSymbol as FiatCurrencies)
    : TOKEN_ICON_URL.replace(TOKEN_ICON_URL_REPLACER, tokenSymbol);

  return (
    <StyledSvg
      status={status}
      svg={svg}
      onError={onError}
      viewBox='0 0 18 18'
      uri={iconUrl}
      {...props}
    />
  );
};

export default TokenIcon;
