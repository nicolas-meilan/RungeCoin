import React, { useEffect, useMemo, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ethers } from 'ethers';
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
import useBalances, { TokensBalanceArrayItem } from '@hooks/useBalances';
import useBiometrics from '@hooks/useBiometrics';
import useBlockchainData from '@hooks/useBlockchainData';
import useConsolidatedCurrency from '@hooks/useConsolidatedCurrency';
import useMiningPendingTxs from '@hooks/useMiningPendingTxs';
import useNotifications from '@hooks/useNotifications';
import useTokenConversions from '@hooks/useTokenConversions';
import useTx from '@hooks/useTx';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import type { WalletTx } from '@http/tx/types';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { numberToFiatBalance, numberToFormattedString } from '@utils/formatter';
import { Blockchains } from '@web3/constants';
import { GWEI, TokenSymbol, TokenType } from '@web3/tokens';
import { isValidAddressToSend } from '@web3/tx';
import { SenndTxReturn } from '@web3/tx/types';
import { getAddressRegex } from '@web3/wallet';

const FooterWrapper = styled.View`
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


const MiningPendingTxsMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.warning};
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

const TotalFeeText = styled(Text) <{ error: boolean }>`
  ${({ error, theme }) => (error ? `
    color: ${theme.colors.error};
  ` : '')}
`;

type SendScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.send>;

const SendScreen = ({ navigation, route }: SendScreenProps) => {
  const theme = useTheme();
  const { dispatchNotification } = useNotifications();

  const [firstRender, setFirstRender] = useState(true);

  const { consolidatedCurrency } = useConsolidatedCurrency();

  const {
    biometricsEnabled,
    dispatchBiometrics,
  } = useBiometrics();

  const {
    blockchain,
    isBlockchainInitialLoading,
    tokens: tokensObj,
    blockchainBaseToken,
  } = useBlockchainData();

  const {
    walletPublicValues,
    walletPublicValuesLoading,
  } = useWalletPublicValues();

  const tokens = useMemo(() => Object.values(tokensObj), [tokensObj]);

  const [tokenToSend, setTokenToSend] = useState<TokenType | null>(
    tokens.find(({ symbol }) => (symbol === route.params?.tokenToSendSymbol)) || null,
  );

  const onAddError = () => navigation.navigate(ScreenName.home);
  const onAddSuccess = (txData: WalletTx) => {
    if (!tokenToSend || !txData) return;

    navigation.navigate(ScreenName.tx, {
      token: tokenToSend,
      tx: txData,
      forceHome: true,
    });
  };

  const {
    addTx,
    updateTxs,
    txs,
    txsLoading,
  } = useMiningPendingTxs({
    onAddError,
    onAddSuccess,
  });

  const onSendFinish = (txData: SenndTxReturn<WalletTx | undefined>) => addTx(txData);

  const {
    estimatedTxFees,
    estimatedTxFeesLoading,
    fetchEstimateTxFees,
    sendTokenLoading,
    sendToken,
    sendTokenError,
  } = useTx({ onSendFinish });

  const { convert } = useTokenConversions({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const {
    orderTokens,
    tokenBalances,
    tokenBalancesLoading,
  } = useBalances({
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const [addressToSend, setAddressToSend] = useState('');
  const [addressToSendError, setAddressToSendError] = useState(false);

  const blockchainBaseTokenBalance = useMemo(() => (
    tokenBalances?.[blockchainBaseToken.symbol] || 0
  ), [blockchainBaseToken, tokenBalances]);

  const hasNotBalanceForGas = useMemo(() => (
    estimatedTxFees?.totalFee.gt(blockchainBaseTokenBalance) || false
  ), [estimatedTxFees, tokenBalances]);

  const allDataSetted = !addressToSendError && !!addressToSend && !!tokenToSend?.symbol;

  const onAddressChange = (newAddress: string) => {
    setAddressToSendError(!!newAddress && !isValidAddressToSend(blockchain, newAddress));
    setAddressToSend(newAddress);
  };

  useEffect(() => {
    updateTxs();
    if (firstRender) {
      setFirstRender(false);
      return;
    }

    setTokenToSend(null);
    onAddressChange('');
  }, [blockchain]);

  useEffect(() => {
    if (allDataSetted) fetchEstimateTxFees(addressToSend, tokenToSend);
  }, [tokenToSend, addressToSend, addressToSendError]);

  useEffect(() => {
    if (sendTokenError) dispatchNotification('main.send.sendError', 'error');
  }, [sendTokenError]);

  const onTokenChange = (newToken: Option<TokenType>) => setTokenToSend(newToken.data);

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
    if (estimatedTxFees?.totalFee.gt(blockchainBaseTokenBalance)) {
      dispatchNotification('main.send.notFoundsForFeeNotification', 'error');
      return;
    }
    sendToken(addressToSend, tokenToSend, amount);
  };

  const onScanQr = (qrCode: string) => {
    const addressRegex = getAddressRegex(blockchain);
    const address = addressRegex.exec(qrCode)?.[0] || '';

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

  const hasPendingTxsWithThisToken = useMemo(() => {
    if (!tokenToSend) return false;

    return !!txs.find((item) => item.contractAddress === tokenToSend.address);
  }, [txs, tokenToSend]);

  const tokensList = useMemo(() => {
    const tokensToSelect = orderTokens();
    if (!tokensToSelect) return [];

    return tokensToSelect.map((tokenBalanceItem: TokensBalanceArrayItem) => {
      const token = tokensObj[tokenBalanceItem.symbol as TokenSymbol]!;

      return {
        value: token.symbol as string,
        data: token,
        label: token.name,
        leftComponent: <TokenIcon tokenSymbol={token.symbol} size={24} />,
        disabled: !tokenBalances || tokenBalances?.[token.symbol].isZero(),
      };
    });
  }, [tokenBalances]);

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
        disableHardwareBack
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
        {allDataSetted && blockchain !== Blockchains.TRON && (
          <>
            <GasMessage
              text="main.send.gasDescription"
            />
            <Card>
              <GasTitle text="main.send.gasFee" avoidTopMargin />
              <Skeleton
                isLoading={estimatedTxFeesLoading}
                height={14}
                width="90%"
                quantity={2}
              >
                <Text
                  text="main.send.gasUnits"
                  i18nArgs={{
                    units: estimatedTxFees?.gasUnits?.toNumber(),
                  }}
                />
                <Text
                  text="main.send.gasPrice"
                  i18nArgs={{
                    price: `${numberToFormattedString(estimatedTxFees?.gasPrice || 0, {
                      decimals: GWEI.toLowerCase(),
                    })} ${GWEI}`,
                  }}
                />
              </Skeleton>
              <GasTitle text="main.send.totalFee" />
              <Skeleton
                isLoading={estimatedTxFeesLoading}
                height={14}
                width="90%"
                quantity={2}
              >
                <TotalFeeText
                  error={hasNotBalanceForGas}
                  text={`≈ ${numberToFormattedString(estimatedTxFees?.totalFee || 0, {
                    decimals: blockchainBaseToken.decimals,
                  })} ${blockchainBaseToken.symbol}`}
                />
                <Text
                  text={numberToFiatBalance(
                    convert(estimatedTxFees?.totalFee || 0, blockchainBaseToken),
                    consolidatedCurrency,
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
        <FooterWrapper>
          {hasPendingTxsWithThisToken && (
            <MiningPendingTxsMessage text="main.send.miningPendingTxs" />
          )}
          <Button
            text="common.continue"
            disabled={!allDataSetted || hasNotBalanceForGas}
            loading={estimatedTxFeesLoading
              || sendTokenLoading
              || isBlockchainInitialLoading
              || walletPublicValuesLoading
              || tokenBalancesLoading
              || txsLoading
            }
            onPress={openCalculator}
          />
        </FooterWrapper>
      </ScreenLayout>
      <Calculator
        visible={showCalculator}
        tokenSymbol={tokenToSend?.symbol}
        onClose={closeCalculator}
        onEnd={onCalculatorEnd}
        transactionFee={estimatedTxFees?.totalFee}
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
