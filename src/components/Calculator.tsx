import React, { useEffect, useMemo, useRef, useState } from 'react';

import { BigNumber, utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import Button from '@components/Button';
import Icon from '@components/Icon';
import Pill from '@components/Pill';
import Skeleton from '@components/Skeleton';
import Svg from '@components/Svg';
import Text, { Weight } from '@components/Text';
import BottomSheet from '@containers/Bottomsheet';
import useBalances from '@hooks/useBalances';
import { INPUT_NUMBER, localizeNumber, numberToFormattedString } from '@utils/formatter';
import { bigNumberMulNumber } from '@utils/number';
import { BASE_TOKEN_ADDRESS, TokenSymbol, TOKENS_ETH } from '@web3/tokens';

type CalculatorProps = {
  onEnd: (amount: string) => void;
  onClose?: () => void;
  visible?: boolean;
  loading?: boolean;
  disabled?: boolean;
  tokenSymbol?: TokenSymbol;
  transactionFee?: BigNumber;
};

const ANIMATION_DURATION = 1000;
const TOUCH_VELOCITY = 150;
const BUTTONS_SIZE = 65;
const PERCENTAGES = [
  0.25, 0.5, 0.75, 1,
];
const DELETE_BUTTON = 'x';
const KEYBOARD_BUTTONS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  DELETE_BUTTON, '0', 'number.decimalSeparator',
];

const Bottom = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const Keyboard = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ButtonWrapper = styled.View`
  width: 33%;
  padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
`;

const KeyboardButton = styled.View`
  width: ${BUTTONS_SIZE}px;
  height: ${BUTTONS_SIZE}px;
  border-radius: ${BUTTONS_SIZE / 2}px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const TouchableWrapper = styled.TouchableOpacity``;

const KeyboardButtonText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[28]};
  color: ${({ theme }) => theme.colors.primary};
`;

const DeleteIconWrapper = styled.View``;

const DeleteIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.primary};
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

const GasFee = styled(Text)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  vertical-align: middle;
`;

const TOKENS = TOKENS_ETH;

const Calculator = ({
  onEnd,
  onClose,
  tokenSymbol,
  loading = false,
  visible = false,
  disabled = false,
  transactionFee = BigNumber.from(0),
}: CalculatorProps) => {
  const { t } = useTranslation();
  const {
    tokenBalances,
    refetchBalances,
    tokenBalancesLoading,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const [amount, setAmount] = useState('0');
  const [balanceExceeded, setBalanceExceeded] = useState(false);

  const token = useMemo(() => (tokenSymbol ? TOKENS[tokenSymbol] : null), [tokenSymbol]);

  const maxAmount = useMemo(() => {
    const balance = token ? tokenBalances?.[token.symbol] : null;

    if (token?.address !== BASE_TOKEN_ADDRESS) return balance || BigNumber.from(0);

    const max = balance?.sub(transactionFee) || BigNumber.from(0);

    return max.isNegative() ? BigNumber.from(0) : max;
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

    setBalanceExceeded(Number(amount) > Number(utils.formatUnits(maxAmount, token.decimals)));
  }, [amount, tokenBalances, token]);

  const onCloseAnimationEnd = () => resetState();

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
    if (!token || !tokenBalances || maxAmount.isZero()) return;

    setAmount(bigNumberMulNumber(maxAmount, percentage, token.decimals).toString());
  };

  const pills = useMemo(() => (
    <>
      {!!tokenSymbol && (
        <Pills>
          {PERCENTAGES.map((percentage, index) => (
            <PercentagePill
              isFirst={!index}
              key={percentage}
              text={`${percentage * 100}%`}
              onPress={() => onPressPill(percentage)}
            />
          ))}
        </Pills>
      )}
    </>
  ), [token, maxAmount]);

  const keyboard = useMemo(() => (
    <Keyboard>
      {KEYBOARD_BUTTONS.map((key) => (
        <ButtonWrapper key={`KEYBOARD_${key}`}>
          {key === DELETE_BUTTON ? (
            <DeleteIconWrapper
              onTouchStart={() => onTouchStart(key)}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              <DeleteIcon
                name="backspace-outline"
                hitSlop={BUTTONS_SIZE / 2}
                onPress={() => { }} // I need the touchable feedback
              />
            </DeleteIconWrapper>
          ) : (
            <TouchableWrapper>
              <KeyboardButton
                onTouchStart={() => onTouchStart(key)}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
              >
                <KeyboardButtonText text={key} />
              </KeyboardButton>
            </TouchableWrapper>
          )}
        </ButtonWrapper>
      ))}
    </Keyboard>
  ), [token]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      topMargin={100}
      animationDuration={ANIMATION_DURATION}
      onCloseAnimationEnd={onCloseAnimationEnd}
    >
      {!!token && (
        <Token>
          <Svg svg={token.svg} />
          <SkeletonWrapper isLoading={tokenBalancesLoading}>
            <Skeleton
              isLoading={tokenBalancesLoading}
              height={25}
            >
              {!!tokenBalances && (
                <TokenText
                  text={`${numberToFormattedString(tokenBalances[token.symbol], {
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
        weight={Weight.BOLD}
        balanceExceeded={balanceExceeded}
        noI18n
      />
      {balanceExceeded && <ExceededError text="main.calculator.exceededBalance" />}
      {!transactionFee.isZero() && (
        <GasFee
          text="main.calculator.gasFee"
          i18nArgs={{
            fee: `${numberToFormattedString(transactionFee, { decimals: TOKENS_ETH.ETH?.decimals })} ${TOKENS_ETH.ETH?.symbol}`,
          }}
        />
      )}
      <Bottom>
        {pills}
        {keyboard}
        <Button
          onPress={() => onEnd(amount)}
          text="common.continue"
          loading={loading || tokenBalancesLoading}
          disabled={disabled || !Number(amount) || balanceExceeded}
        />
      </Bottom>
    </BottomSheet>
  );
};

export default Calculator;
