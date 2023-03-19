import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import styled, { useTheme } from 'styled-components/native';

import { FiatCurrencies } from '@utils/constants';
import { TOKENS_ETH } from '@web3/tokens';


const TOKENS = Object.values(TOKENS_ETH);

const THEME = '{{THEME}}';
const LOCALE = '{{LOCALE}}';
const TOKENS_WIDGET = '{{TOKEN}}';

const HTML = `
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
  {
  "symbols": [${TOKENS_WIDGET}],
  "showSymbolLogo": true,
  "colorTheme": "${THEME}",
  "isTransparent": true,
  "displayMode": "regular",
  "locale": "${LOCALE}"
}
  </script>
</div>
`;

// opacity 0.99 to fix webview crash with navigation animation
const StyledWebView = styled(WebView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  opacity: 0.99;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const TokenPrices = () => {
  const theme = useTheme();
  const { i18n } = useTranslation();

  const tokensWidget = useMemo(() => TOKENS.map((token) => `{
    "proName": "${token.symbol}${FiatCurrencies.USD}",
    "title": "${token.name}"
  }`).join(','), [TOKENS, FiatCurrencies]);

  const html = HTML
    .replace(TOKENS_WIDGET, tokensWidget)
    .replace(LOCALE, i18n.language)
    .replace(THEME, theme.name);

  return (
    <>
      <StyledWebView
        scalesPageToFit={false}
        source={{ html }}
      />
      <Overlay />
    </>
  );
};

export default TokenPrices;
