import React, { useEffect, useMemo, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BigNumber, ethers } from 'ethers';
import styled, { useTheme } from 'styled-components/native';

import BlockchainSelector from '@components/BlockchainSelector';
import Button from '@components/Button';
import Calculator from '@components/Calculator';
import Card from '@components/Card';
import HwConnectionSelector from '@components/HwConnectionSelector';
import QrScanner from '@components/QrScanner';
import ScreenLayout from '@components/ScreenLayout';
import Select, { Option } from '@components/Select';
import Skeleton from '@components/Skeleton';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TokenIcon from '@components/TokenIcon';
import TokenItem from '@components/TokenItem';
import useBalances from '@hooks/useBalances';
import useBiometrics from '@hooks/useBiometrics';
import useBlockchainData from '@hooks/useBlockchainData';
import useNotifications from '@hooks/useNotifications';
import useTokenConversions from '@hooks/useTokenConversions';
import useTx from '@hooks/useTx';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { FiatCurrencies } from '@utils/constants';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { GWEI, TokenType } from '@web3/tokens';
import { WALLET_ADDRESS_REGEX } from '@web3/wallet';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

const StyledSelector = styled(Select)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const AddressToSendInput = styled(TextInput)`
  margin-vertical: ${({ theme }) => theme.spacing(4)};
`;

const GasMessage = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const GasTitle = styled(Text).attrs({
  weight: 'bold',
}) <{ avoidTopMargin?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ avoidTopMargin, theme }) => (avoidTopMargin ? 0 : theme.spacing(2))};
`;

const HwMessage = styled(Text)`
  margin: ${({ theme }) => theme.spacing(4)} 0 ${({ theme }) => theme.spacing(4)} 0;
`;

const TotalFeeText = styled(Text)<{ error: boolean }>`
  ${({ error, theme }) => (error ? `
    color: ${theme.colors.error};
  ` : '')}
`;

type SendScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.send>;

const SendScreen = ({ navigation, route }: SendScreenProps) => {
  const theme = useTheme();
  const { dispatchNotification } = useNotifications();
  const {
    biometricsEnabled,
    dispatchBiometrics,
  } = useBiometrics();
  const {
    estimatedTxInfo,
    estimatedTxInfoLoading,
    fetchestimateTxInfo,
    sendTokenLoading,
    sendToken,
    sendTokenError,
  } = useTx({
    onSendFinish: () => {
      dispatchNotification('main.send.successNotification');
      navigation.navigate(ScreenName.home);
    },
  });

  const {
    walletPublicValues,
    walletPublicValuesLoading,
  } = useWalletPublicValues();

  const {
    blockchain,
    isBlockchainInitialLoading,
    tokens: tokensObj,
    blockchainBaseToken,
  } = useBlockchainData();

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

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
    tokens.find(({ symbol }) => (symbol === route.params?.tokenToSendSymbol)) || null,
  );

  const [showCalculator, setShowCalculator] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const [addressToSend, setAddressToSend] = useState('');
  const [addressToSendError, setAddressToSendError] = useState(false);

  const hasNotBalanceForGas = useMemo(() => (
    estimatedTxInfo?.totalFee.gt(tokenBalances?.[blockchainBaseToken.symbol] || 0) || false
  ), [estimatedTxInfo, tokenBalances]);

  const allDataSetted = !addressToSendError && !!addressToSend && !!tokenToSend?.symbol;

  useEffect(() => setTokenToSend(null), [blockchain]);

  useEffect(() => {
    if (allDataSetted) fetchestimateTxInfo(addressToSend, tokenToSend.address);
  }, [tokenToSend, addressToSend, addressToSendError]);

  const tokenToSendBalance = useMemo(() => {
    if (!tokenBalances || !tokenToSend) return BigNumber.from(0);

    return tokenBalances[tokenToSend.symbol];
  }, [tokenToSend]);

  useEffect(() => {
    if (sendTokenError) dispatchNotification('main.send.sendError', 'error');
  }, [sendTokenError]);

  const onTokenChange = (newToken: Option<TokenType>) => setTokenToSend(newToken.data);
  const onAddressChange = (newAddress: string) => {
    setAddressToSendError(!!newAddress && !ethers.utils.isAddress(newAddress));
    setAddressToSend(newAddress);
  };

  const openCalculator = () => setShowCalculator(true);
  const closeCalculator = () => setShowCalculator(false);

  const openQrScanner = () => setShowQrScanner(true);
  const closeQrScanner = () => setShowQrScanner(false);

  const onCalculatorEnd = async (amount: string) => {
    if (!tokenToSend) return;
    
    if (biometricsEnabled) {
      const success = await dispatchBiometrics();
      if (!success) return;
    }

    closeCalculator();
    if (estimatedTxInfo?.totalFee.gt(tokenToSendBalance)) {
      dispatchNotification('main.send.notFoundsForFeeNotification', 'error');
      return;
    }
    sendToken(addressToSend, tokenToSend, amount);
  };

  const onScanQr = (qrCode: string) => {
    const address = WALLET_ADDRESS_REGEX.exec(qrCode)?.[0] || '';

    const qrError = !ethers.utils.isAddress(address);
    if (qrError) {
      dispatchNotification('main.send.qr.invalidNotification', 'error');
      setAddressToSend('');
      closeQrScanner();
      return;
    }

    setAddressToSendError(false);
    setAddressToSend(address);
    closeQrScanner();
  };

  const tokensList = useMemo(() => tokens.map((token: TokenType) => ({
    value: token.symbol as string,
    data: token,
    label: token.name,
    leftComponent: <TokenIcon tokenSymbol={token.symbol} size={24} />,
    disabled: !tokenBalances || tokenBalances?.[token.symbol].isZero(),
  })), [tokenBalances]);

  const goBack = () => {
    if (sendTokenLoading) return;

    navigation.goBack();
  };

  return (
    <>
      <ScreenLayout
        bigTitle
        scroll
        title="main.send.title"
        goBack={goBack}
      >
        <BlockchainSelector
          label="main.send.inputs.blockchainSelectorLabel"
          disabled={sendTokenLoading}
        />
        <StyledSelector
          selected={tokenToSend?.symbol}
          label="main.send.inputs.selectTokenLabel"
          placeholder="main.send.inputs.selectTokenPlaceholder"
          options={tokensList}
          disabled={sendTokenLoading}
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
          pressDisabled={sendTokenLoading}
          editable={!sendTokenLoading}
          onChangeText={onAddressChange}
          error={addressToSendError}
          icon="qrcode-scan"
          onPressIcon={openQrScanner}
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
                <TotalFeeText
                  error={hasNotBalanceForGas}
                  text={`≈ ${numberToFormattedString(estimatedTxInfo?.totalFee || 0, {
                    decimals: blockchainBaseToken.decimals,
                  })} ${blockchainBaseToken.symbol}`}
                />
                <Text
                  text={numberToFiatBalance(
                    convert(estimatedTxInfo?.totalFee || 0, blockchainBaseToken),
                    FiatCurrencies.USD,
                  )}
                />
              </Skeleton>
            </Card>
          </>
        )}
        {!!walletPublicValues?.isHw && (
          <>
            <HwMessage text="hw.guide" />
            <HwConnectionSelector disabled={sendTokenLoading} />
          </>
        )}
        <StyledButton
          text="common.continue"
          disabled={!allDataSetted || hasNotBalanceForGas}
          loading={estimatedTxInfoLoading
            || sendTokenLoading
            || isBlockchainInitialLoading
            || walletPublicValuesLoading
          }
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
      <QrScanner
        visible={showQrScanner}
        onClose={closeQrScanner}
        onScan={onScanQr}
        title="main.send.qr.title"
        message="main.send.qr.message"
      />
    </>
  );
};

export default SendScreen;
