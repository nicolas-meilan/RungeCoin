import React, { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import styled, { useTheme } from 'styled-components/native';

import Skeleton from './Skeleton';
import CandlesChartLayout from './Skeleton/CandlesChartLayout';
import { FiatCurrencies } from '@utils/constants';
import type { TokenType } from '@web3/tokens';

const CHART_HEIGHT = 500;
const LOADING_BORDERS = 20;

const LOADING_TIME = '5000';
const READY_MESSAGE = 'ready';

const THEME = '{{THEME}}';
const LOCALE = '{{LOCALE}}';
const TOKEN = '{{TOKEN}}';
const FIAT = '{{FIAT}}';

const HTML = `
	<div>
  <div id='chart'></div>
  <script type='text/javascript' src='https://s3.tradingview.com/tv.js'></script>
  <script type='text/javascript'>
     new TradingView.widget({
      autosize: true,
      symbol: '${TOKEN}${FIAT}',
      theme: '${THEME}',
      locale: '${LOCALE}',
      interval: 'D',
      timezone: 'Etc/UTC',
      style: '1',
      hide_top_toolbar: true,
      allow_symbol_change: false,
      enable_publishing: false,
      withdateranges: true,
      save_image: false,
      container_id: 'chart'
    });

    const timeout = setTimeout(() => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ ${READY_MESSAGE}: true }));
      clearTimeout(timeout);
    }, ${LOADING_TIME});
  </script>
  </div>
`;


type TradingViewChartProps = {
  token: TokenType;
};

const StyledWebView = styled(WebView) <{ isLoading: boolean }>`
  flex: 1
  background-color: ${({ theme }) => theme.colors.background.primary};
  ${({ isLoading }) => (isLoading ? `
    opacity: 0;
  ` : '')}
`;

const ChartSkeleton = styled(Skeleton)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid ${({ theme }) => theme.colors.disabled};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const Wrapper = styled.View`
  width: 100%;
  height: ${CHART_HEIGHT}px;
`;

const TradingViewChart = ({ token }: TradingViewChartProps) => {
  const theme = useTheme();
  const { i18n } = useTranslation();

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const [loading, setLoading] = useState(true);

  const chart = HTML
    .replace(TOKEN, token.symbol)
    .replace(FIAT, FiatCurrencies.USD)
    .replace(LOCALE, i18n.language)
    .replace(THEME, theme.name);

  const onLayout = (event: LayoutChangeEvent) => setSize({
    width: event.nativeEvent.layout.width - LOADING_BORDERS,
    height: event.nativeEvent.layout.height - LOADING_BORDERS,
  });

  return (
    <Wrapper onLayout={onLayout}>
      <ChartSkeleton
        isLoading={loading}
        Layout={CandlesChartLayout}
        height={size.height}
        width={size.width}
      />
      <StyledWebView
        isLoading={loading}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        source={{ html: chart }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data[READY_MESSAGE]) setLoading(false);
        }}
      />
    </Wrapper>
  );
};

export default TradingViewChart;
