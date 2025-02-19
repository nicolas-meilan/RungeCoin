import React, { useEffect, useMemo, useRef, useState } from 'react';

import { parseUnits } from 'ethers';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import NumericKeyboard, { DELETE_BUTTON } from './NumericKeyboard';
import Button from '@components/Button';
import Pill from '@components/Pill';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import TokenIcon from '@components/TokenIcon';
import BottomSheet from '@containers/Bottomsheet';
import useBalances from '@hooks/useBalances';
import useBlockchainData from '@hooks/useBlockchainData';
import { INPUT_NUMBER, localizeNumber, numberToFormattedString } from '@utils/formatter';
import { isZero } from '@utils/number';
import type { TokenSymbol } from '@web3/tokens';

type CalculatorProps = {
  onEnd: (amount: string) => void;
  onClose?: () => void;
  visible?: boolean;
  loading?: boolean;
  disabled?: boolean;
  tokenSymbol?: TokenSymbol;
  transactionFee?: bigint;
};

const ANIMATION_DURATION = 1000;
const TOUCH_VELOCITY = 150;
const TOP_MARGIN = 50;
const PERCENTAGES = [
  25, 50, 75, 100,
];

const Content = styled.View`
  flex-grow: 1;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Token = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const TokenText = styled(Text)`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fonts.size[20]};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const Amount = styled(Text) <{ balanceExceeded: boolean }>`
  text-align: center;
  vertical-align: middle;
  margin: ${({ theme }) => theme.spacing(4)} 0;
  font-size: ${({ theme }) => theme.fonts.size[28]};
  ${({ theme, balanceExceeded }) => (balanceExceeded ? `
    color: ${theme.colors.error};`
    : '')}
`;

const SkeletonWrapper = styled.View<{ isLoading: boolean }>`
  ${({ isLoading, theme }) => (isLoading ? `
    margin-left: ${theme.spacing(2)};
    width: 30%;
  ` : '')}
`;

const Pills = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const PercentagePill = styled(Pill) <{ isFirst: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[12]};
  padding: ${({ theme }) => theme.spacing(1)};
  ${({ isFirst, theme }) => (isFirst ? '' : `
    margin-left: ${theme.spacing(2)};
  `)}
`;

const ExceededError = styled(Text)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.error};
`;

const Fee = styled(Text)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  vertical-align: middle;
`;

const Calculator = ({
  onEnd,
  onClose,
  tokenSymbol,
  loading = false,
  visible = false,
  disabled = false,
  transactionFee = 0n,
}: CalculatorProps) => {
  const { t } = useTranslation();

  const {
    tokens,
    blockchainBaseToken,
  } = useBlockchainData();
  const {
    tokenBalances,
    refetchBalances,
    tokenBalancesLoading,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [amount, setAmount] = useState('0');
  const [balanceExceeded, setBalanceExceeded] = useState(false);

  const token = useMemo(() => (tokenSymbol ? tokens[tokenSymbol] : null), [tokenSymbol]);

  const maxAmount = useMemo(() => {
    const balance = token ? tokenBalances?.[token.symbol] : null;

    if (token?.symbol !== blockchainBaseToken.symbol) return balance || 0n;

    const max = (balance || 0n) - transactionFee;

    return max < 0n ? 0n : max;
  }, [tokenBalances, token, transactionFee]);

  const resetState = () => {
    setBalanceExceeded(false);
    setAmount('0');
  };

  useEffect(() => {
    if (visible) refetchBalances();
  }, [visible]);

  useEffect(() => {
    if (!token || !tokenBalances) return;

    const amountBN = parseUnits(amount, token.decimals);
    setBalanceExceeded(amountBN > maxAmount);
  }, [amount, tokenBalances, token]);

  const onKeyPress = (key: string) => setAmount((prevAmount) => {
    const value = t(key);

    if (value === DELETE_BUTTON) return prevAmount.slice(0, -1) || '0';

    const separator = t('number.decimalSeparator');
    const newAmount = `${prevAmount}${value}`.replace(separator, '.');

    if (!INPUT_NUMBER.test(newAmount)) return prevAmount;

    const [, decimals = ''] = newAmount.split('.');

    if (token && decimals.length > token.decimals) return prevAmount;

    return newAmount;
  });

  const onTouchEnd = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const onTouchStart = (key: string) => {
    onTouchEnd();

    onKeyPress(key);
    intervalRef.current = setInterval(() => onKeyPress(key), TOUCH_VELOCITY);
  };

  const onPressPill = (percentage: number) => {
    if (!token || !tokenBalances || isZero(maxAmount)) return;

    const newAmount = (maxAmount * BigInt(percentage)) / 100n;
    setAmount(numberToFormattedString(newAmount, {
      decimals: token.decimals,
      localize: false,
    }));
  };

  const handleClose = () => {
    onClose?.();
    resetState();
  };

  const pills = useMemo(() => (
    <>
      {!!tokenSymbol && (
        <Pills>
          {PERCENTAGES.map((percentage, index) => (
            <PercentagePill
              isFirst={!index}
              key={percentage}
              text={`${percentage}%`}
              onPress={() => onPressPill(percentage)}
            />
          ))}
        </Pills>
      )}
    </>
  ), [token, maxAmount]);

  const keyboard = useMemo(() => (
    <NumericKeyboard
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  ), [token]);

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      topMargin={TOP_MARGIN}
      animationDuration={ANIMATION_DURATION}
    >
      <Content>
        {!!token && (
          <Token>
            <TokenIcon iconName={token.iconName} />
            <SkeletonWrapper isLoading={tokenBalancesLoading}>
              <Skeleton
                isLoading={tokenBalancesLoading}
                height={25}
              >
                {!!tokenBalances && (
                  <TokenText
                    text={`${numberToFormattedString(
                      tokenBalances[token.symbol] || 0, {
                        decimals: token.decimals,
                      })} ${token.symbol}`}
                    noI18n
                  />
                )}
              </Skeleton>
            </SkeletonWrapper>
          </Token>
        )}
        <Amount
          text={localizeNumber(amount)}
          weight="bold"
          balanceExceeded={balanceExceeded}
          noI18n
        />
        {balanceExceeded && <ExceededError text="main.calculator.exceededBalance" />}
        {!isZero(transactionFee) && (
          <Fee
            text="main.calculator.fee"
            i18nArgs={{
              fee: `${numberToFormattedString(transactionFee, {
                decimals: blockchainBaseToken.decimals,
              })} ${blockchainBaseToken.symbol}`,
            }}
          />
        )}
      </Content>
      {pills}
      {keyboard}
      <Button
        onPress={() => onEnd(amount)}
        text="common.continue"
        loading={loading || tokenBalancesLoading}
        disabled={disabled || !Number(amount) || balanceExceeded}
      />
    </BottomSheet>
  );
};

export default Calculator;
