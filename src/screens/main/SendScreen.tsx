import React, { useEffect, useMemo, useState } from 'react';

import { PUBLIC_KEY_TO_TEST } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BigNumber, ethers } from 'ethers';
import styled, { useTheme } from 'styled-components/native';

import Button from '@components/Button';
import Calculator from '@components/Calculator';
import Card from '@components/Card';
import ScreenLayout from '@components/ScreenLayout';
import Select, { Option } from '@components/Select';
import Skeleton from '@components/Skeleton';
import Text, { Weight } from '@components/Text';
import TextInput from '@components/TextInput';
import TokenItem from '@components/TokenItem';
import useBalances from '@hooks/useBalances';
import useNotifications, { NotificationTypes } from '@hooks/useNotifications';
import useTokenConversions from '@hooks/useTokenConversions';
import useTx from '@hooks/useTx';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { isDev } from '@utils/config';
import { FiatCurrencies } from '@utils/constants';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { GWEI, TOKENS_ETH, TokenType } from '@web3/tokens';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

const AddressToSendInput = styled(TextInput)`
  margin-vertical: ${({ theme }) => theme.spacing(4)};
`;

const GasMessage = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const GasTitle = styled(Text).attrs({
  weight: Weight.BOLD,
}) <{ avoidTopMargin?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ avoidTopMargin, theme }) => (avoidTopMargin ? 0 : theme.spacing(2))};
`;

type SendScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.send>;

const TOKENS = Object.values(TOKENS_ETH);

const SendScreen = ({ navigation, route }: SendScreenProps) => {
  const theme = useTheme();
  const { dispatchNotification } = useNotifications();
  const [bottomSheetOpened, setBottomSheetOpened] = useState(false);
  const {
    estimatedTxInfo,
    estimatedTxInfoLoading,
    fetchestimateTxInfo,
    sendTokenLoading,
    sendToken,
  } = useTx({
    onSendFinish: () => {
      dispatchNotification('main.send.successNotification', NotificationTypes.SUCCESS);
      navigation.goBack();
    },
  });

  const { convert } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { tokenBalances, tokenBalancesLoading } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [tokenToSend, setTokenToSend] = useState<TokenType | null>(
    TOKENS.find(({ symbol }) => ( symbol === route.params?.tokenToSendSymbol)) || null,
  );

  const [showCalculator, setShowCalculator] = useState(false);

  const [addressToSend, setAddressToSend] = useState(isDev() ? PUBLIC_KEY_TO_TEST : '');
  const [addressToSendError, setAddressToSendError] = useState(false);

  const allDataSetted = !addressToSendError && !!addressToSend && !!tokenToSend?.symbol;

  useEffect(() => {
    if (allDataSetted) fetchestimateTxInfo(addressToSend, tokenToSend.address);
  }, [tokenToSend, addressToSend, addressToSendError]);

  const tokenToSendBalance = useMemo(() => {
    if (!tokenBalances || !tokenToSend) return BigNumber.from(0);

    return tokenBalances[tokenToSend.symbol];
  }, [tokenToSend]);

  const onTokenChange = (newToken: Option<TokenType>) => setTokenToSend(newToken.data);
  const onAddressChange = (newAddress: string) => {
    setAddressToSendError(!!newAddress && !ethers.utils.isAddress(newAddress));
    setAddressToSend(newAddress);
  };

  const openCalculator = () => setShowCalculator(true);
  const closeCalculator = () => setShowCalculator(false);

  const onCalculatorEnd = (amount: string) => {
    if (!tokenToSend) return;

    closeCalculator();
    if (estimatedTxInfo?.totalFee.gt(tokenToSendBalance)) {
      dispatchNotification('main.send.notFoundsForFeeNotification', NotificationTypes.ERROR);
      return;
    }
    sendToken(addressToSend, tokenToSend, amount);
  };

  const tokensList = useMemo(() => TOKENS.map((token: TokenType) => ({
    value: token.symbol as string,
    data: token,
    label: token.name,
    svg: token.svg,
    disabled: tokenBalances?.[token.symbol].isZero(),
  })), [tokenBalances]);

  return (
    <>
      <ScreenLayout
        bigTitle
        scroll
        title="main.send.title"
        bottomSheetOpened={bottomSheetOpened}
      >
        <Select
          selected={tokenToSend?.symbol}
          label="main.send.inputs.selectTokenLabel"
          placeholder="main.send.inputs.selectTokenPlaceholder"
          options={tokensList}
          onOpen={() => setBottomSheetOpened(true)}
          onClose={() => setBottomSheetOpened(false)}
          optionComponent={(option: Option<TokenType>, selected: boolean) => (
            <TokenItem
              fullName
              withoutMargin
              withBorders={selected}
              borderColor={theme.colors.success}
              disabled={tokenBalances?.[option.data.symbol].isZero()}
              balanceLoading={tokenBalancesLoading}
              balance={tokenBalances?.[option.data.symbol]}
              {...option.data}
            />
          )}
          onChange={onTokenChange}
        />
        <AddressToSendInput
          label="main.send.inputs.addressLabel"
          placeholder="main.send.inputs.addressPlaceholder"
          errorMessage="main.send.inputs.addressError"
          value={addressToSend}
          onChangeText={onAddressChange}
          error={addressToSendError}
        />
        {allDataSetted && (
          <>
            <GasMessage
              text="main.send.gasDescription"
            />
            <Card>
              <GasTitle text="main.send.gasFee" avoidTopMargin />
              <Skeleton
                isLoading={estimatedTxInfoLoading}
                height={14}
                width="90%"
                quantity={2}
              >
                <Text
                  text="main.send.gasUnits"
                  i18nArgs={{
                    units: estimatedTxInfo?.gasUnits.toNumber(),
                  }}
                />
                <Text
                  text="main.send.gasPrice"
                  i18nArgs={{
                    price: `${numberToFormattedString(estimatedTxInfo?.gasPrice || 0, {
                      decimals: GWEI.toLowerCase(),
                    })} ${GWEI}`,
                  }}
                />
              </Skeleton>
              <GasTitle text="main.send.totalFee" />
              <Skeleton
                isLoading={estimatedTxInfoLoading}
                height={14}
                width="90%"
                quantity={2}
              >
                <Text text={`≈ ${numberToFormattedString(estimatedTxInfo?.totalFee || 0, {
                  decimals: TOKENS_ETH.ETH?.decimals,
                })} ${TOKENS_ETH.ETH?.symbol}`} />
                <Text
                  text={numberToFiatBalance(convert(estimatedTxInfo?.totalFee || 0, TOKENS_ETH.ETH!), FiatCurrencies.USD)}
                />
              </Skeleton>
            </Card>
          </>
        )}
        <StyledButton
          text="common.continue"
          disabled={!allDataSetted}
          loading={estimatedTxInfoLoading || sendTokenLoading}
          onPress={openCalculator}
        />
      </ScreenLayout>
      <Calculator
        visible={showCalculator}
        tokenSymbol={tokenToSend?.symbol}
        onClose={closeCalculator}
        onEnd={onCalculatorEnd}
        transactionFee={estimatedTxInfo?.totalFee}
      />
    </>
  );
};

export default SendScreen;