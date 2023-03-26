import React, { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import styled, { useTheme } from 'styled-components/native';

import ErrorWrapper from './ErrorWrapper';
import Skeleton from './Skeleton';
import CandlesChartLayout from './Skeleton/CandlesChartLayout';
import { FiatCurrencies } from '@utils/constants';
import type { TokenType } from '@web3/tokens';

const CHART_HEIGHT = 450;
const LOADING_BORDERS = 20;

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

    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.name === 'widgetReady') window.ReactNativeWebView.postMessage(JSON.stringify({ ${READY_MESSAGE}: true }));
      } catch (error) {}
    });
  </script>
  </div>
`;


type TradingViewChartProps = {
  token?: TokenType | null;
};

// opacity 0.99 to fix webview crash with navigation animation
const StyledWebView = styled(WebView) <{ isLoading: boolean }>`
  flex: 1
  background-color: ${({ theme }) => theme.colors.background.primary};
  opacity: ${({ isLoading }) => (isLoading ? 0 : 0.99)};
`;

const Wrapper = styled.View`
  width: 100%;
  height: ${CHART_HEIGHT}px;
`;

const ChartSkeletonWrapper = styled(Wrapper)`
  position: absolute;
  border: 1px solid ${({ theme }) => theme.colors.disabled};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.borderRadius};
  justify-content: center;
`;

const TradingViewChart = ({ token }: TradingViewChartProps) => {
  const theme = useTheme();
  const { i18n } = useTranslation();

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const [loading, setLoading] = useState(true);

  const html = token
    ? HTML
      .replace(TOKEN, token.symbol)
      .replace(FIAT, FiatCurrencies.USD)
      .replace(LOCALE, i18n.language)
      .replace(THEME, theme.name)
    : '';

  const onLayout = (event: LayoutChangeEvent) => setSize({
    width: event.nativeEvent.layout.width - LOADING_BORDERS,
    height: event.nativeEvent.layout.height - LOADING_BORDERS,
  });

  const sizeLoaded = !!size.height && !!size.width;
  const showSkeleton = sizeLoaded && (loading || !token);

  return (
    <Wrapper onLayout={onLayout}>
      {showSkeleton && (
        <ChartSkeletonWrapper>
          <Skeleton
            isLoading={!!token}
            Layout={CandlesChartLayout}
            height={size.height / 2}
            width={size.width}
          />
        </ChartSkeletonWrapper>
      )}
      <ErrorWrapper
        requiredValuesToRender={[token]}
        height={CHART_HEIGHT}
      >
        <StyledWebView
          isLoading={loading}
          scalesPageToFit={false}
          source={{ html }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data[READY_MESSAGE]) setLoading(false);
          }}
        />
      </ErrorWrapper>
    </Wrapper>
  );
};

export default TradingViewChart;
