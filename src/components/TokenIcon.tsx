import React, { useState } from 'react';

import styled from 'styled-components/native';

import Svg, { SvgProps } from './Svg';
import defaultTokenIcon from '@assets/defaultTokenIcon.svg';
import {
  TOKEN_ICON_URL,
  TOKEN_ICON_URL_REPLACER,
} from '@http/tokens';
import type { TokenType } from '@web3/tokens';

type TokenIconProps = SvgProps & {
  tokenSymbol: TokenType['symbol'];
};

const StyledSvg = styled(Svg)`
  border-radius: 2000px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.border};
`;

const TokenIcon = ({ tokenSymbol, ...props }: TokenIconProps) => {
  const [hasError, setHasError] = useState(false);

  const onError = () => setHasError(true);

  const svg = hasError ? defaultTokenIcon : null;

  return (
    <StyledSvg
      svg={svg}
      onError={onError}
      viewBox='0 0 18 18'
      uri={TOKEN_ICON_URL.replace(TOKEN_ICON_URL_REPLACER, tokenSymbol)}
      {...props}
    />
  );
};

export default TokenIcon;
