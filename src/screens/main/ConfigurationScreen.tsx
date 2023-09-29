import React, { useEffect, useMemo, useRef, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getVersion } from 'react-native-device-info';
import styled from 'styled-components/native';


import { Languages, changeLanguage } from '../../locale/i18nConfig';
import { AvailableThemes } from '../../theme/themes';
import BlockchainSelector from '@components/BlockchainSelector';
import Button from '@components/Button';
import HwConnectionSelector from '@components/HwConnectionSelector';
import Pill from '@components/Pill';
import ScreenLayout from '@components/ScreenLayout';
import Select from '@components/Select';
import Switch from '@components/Switch';
import Text from '@components/Text';
import Title from '@components/Title';
import TokenIcon from '@components/TokenIcon';
import DoublePrivateKeyEncryptionFlow, { DoublePrivateKeyEncryptionFlowRef, PrivateKeyEncryptionFlows } from '@containers/DoublePrivateKeyEncryptionFlow';
import Modal from '@containers/Modal';
import useBiometrics from '@hooks/useBiometrics';
import useBlockchainData from '@hooks/useBlockchainData';
import useConsolidatedCurrency from '@hooks/useConsolidatedCurrency';
import useDestroyWallet from '@hooks/useDestroyWallet';
import usePrivateKeyConfig from '@hooks/usePrivateKeyConfig';
import useThemeConfiguration from '@hooks/useThemeConfiguration';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';
import { FiatCurrencies } from '@utils/constants';
import {
  BASE_ADDRESS_INDEX,
  getDerivationPath,
} from '@web3/wallet';

const Subtitle = styled(Title).attrs({
  isSubtitle: true,
})`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ConfigurationItem = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const Info = styled(Text)`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CloseWallet = styled(Pill)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const ConfigurationWrapper = styled.ScrollView`
  flex: 1;
`;

const Footer = styled.View`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const CloseWalletModalContent = styled.View`
  flex: 1;
  justify-content: center;
`;

const CloseWalletTitle = styled(Title).attrs({
  isSubtitle: true,
})`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const CloseWalletMessage = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  text-align: center;
`;

const CloseWalletModalButtons = styled.View`
  justify-content: space-around;
  flex-direction: row;
`;

type ConfigurationScreenProps = NativeStackScreenProps<MainNavigatorType, ScreenName.configuration>;

const ConfigurationScreen = ({
  route,
}: ConfigurationScreenProps) => {
  const activateDoubleEncryptionOnMount = route.params?.activateDoubleEncrytion;

  const doubleEncryptionFlowRef = useRef<DoublePrivateKeyEncryptionFlowRef>(null);
  const [closeWalletModalVisible, setCloseWalletModalVisible] = useState(false);

  const { t, i18n } = useTranslation();

  const destroyWallet = useDestroyWallet();
  const { walletPublicValues } = useWalletPublicValues();
  const { blockchain } = useBlockchainData();

  const {
    hasDoubleEncryption,
    privateKeyConfigLoading,
  } = usePrivateKeyConfig();

  const {
    themeMode,
    themeLoading,
    setThemeMode,
  } = useThemeConfiguration();

  const {
    setBiometrics,
    biometricsEnabled,
    deviceHasBiometrics,
    biometricsEnabledLoading,
  } = useBiometrics();

  const {
    consolidatedCurrency,
    setConsolidatedCurrency,
  } = useConsolidatedCurrency();

  const canUseBiometrics = useMemo(deviceHasBiometrics, []);

  const languages = useMemo(() => Object.values(Languages).map((key) => ({
    label: t(`languages.${key}`),
    value: key,
    data: undefined,
  })), [i18n.language]);

  const consolidatedCurrenciesList = useMemo(() => Object.values(FiatCurrencies).map((item) => ({
    label: item,
    value: item,
    leftComponent: <TokenIcon isFiat tokenSymbol={item} size={24} />,
    data: undefined,
  })), []);

  const togglePrivateKeyDoubleEncryption = () => doubleEncryptionFlowRef.current
    ?.startFlow(hasDoubleEncryption
      ? PrivateKeyEncryptionFlows.DISABLE_ENCRYPTION_FLOW
      : PrivateKeyEncryptionFlows.ENABLE_ENCRYPTION_FLOW);

  const toggleCloseWalletModal = (visible: boolean) => setCloseWalletModalVisible(visible);

  useEffect(() => {
    if (activateDoubleEncryptionOnMount) togglePrivateKeyDoubleEncryption();
  }, []);

  return (
    <>
      <DoublePrivateKeyEncryptionFlow
        ref={doubleEncryptionFlowRef}
      />
      <ScreenLayout
        title="main.configuration.title"
        bigTitle
        hasFooterBanner
      >
        <ConfigurationWrapper>
          <Subtitle title="main.configuration.WalletSectionTitle" />
          <ConfigurationItem>
            <BlockchainSelector label="main.configuration.labels.blockchainSelector" />
          </ConfigurationItem>
          <ConfigurationItem>
            <Select
              label="main.configuration.labels.consolidatedCurrencySelector"
              options={consolidatedCurrenciesList}
              selected={consolidatedCurrency}
              onChange={(option) => setConsolidatedCurrency(option.value as FiatCurrencies)}
            />
          </ConfigurationItem>
          {!!walletPublicValues?.isHw && (
            <ConfigurationItem>
              <HwConnectionSelector label="main.configuration.labels.hwConnectionSelector" />
            </ConfigurationItem>
          )}
          {!walletPublicValues?.isHw && (
            <ConfigurationItem>
              <Switch
                value={hasDoubleEncryption}
                label="main.configuration.labels.doublePrivateKeyEncryption"
                loading={privateKeyConfigLoading}
                onChange={togglePrivateKeyDoubleEncryption}
              />
            </ConfigurationItem>
          )}
          <Subtitle title="main.configuration.appSectionTitle" />
          <ConfigurationItem>
            <Switch
              label="access.biometrics.useBiometrics"
              value={biometricsEnabled}
              disabled={!canUseBiometrics}
              loading={biometricsEnabledLoading}
              onChange={async () => setBiometrics(!biometricsEnabled)}
            />
          </ConfigurationItem>
          <ConfigurationItem>
            <Switch
              value={themeMode === AvailableThemes.DARK}
              label="main.configuration.labels.themeSwitcher"
              loading={themeLoading}
              onChange={() => setThemeMode(themeMode === AvailableThemes.DARK
                ? AvailableThemes.LIGHT
                : AvailableThemes.DARK)}
            />
          </ConfigurationItem>
          <ConfigurationItem>
            <Select
              label="main.configuration.labels.languageSelector"
              options={languages}
              selected={i18n.language}
              onChange={(option) => changeLanguage(option.value as Languages)}
            />
          </ConfigurationItem>
          <Info text="main.configuration.labels.changePassword" />
          <CloseWallet
            text="main.configuration.closeWallet.title"
            onPress={() => toggleCloseWalletModal(true)}
            type="error"
          />
        </ConfigurationWrapper>
        <Footer>
          <Info
            text="main.configuration.derivationPath"
            i18nArgs={{
              derivationPath: `${getDerivationPath(blockchain)}/${BASE_ADDRESS_INDEX}`,
            }}
          />
          <Info
            text="main.configuration.appVersion"
            i18nArgs={{
              version: getVersion(),
            }}
          />
        </Footer>
      </ScreenLayout>
      <Modal
        visible={closeWalletModalVisible}
        onClose={() => toggleCloseWalletModal(false)}
      >
        <CloseWalletModalContent>
          <CloseWalletTitle title="main.configuration.closeWallet.title" />
          <CloseWalletMessage text="main.configuration.closeWallet.message" />
        </CloseWalletModalContent>
        <CloseWalletModalButtons>
          <Button
            type="tertiary"
            text="common.cancel"
            onPress={() => toggleCloseWalletModal(false)}
          />
          <Button
            type="error"
            text="common.continue"
            onPress={destroyWallet}
          />
        </CloseWalletModalButtons>
      </Modal>
    </>
  );
};

export default ConfigurationScreen;
