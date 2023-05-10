import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { getVersion } from 'react-native-device-info';
import styled from 'styled-components/native';


import { Languages } from '../../locale/i18nConfig';
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
import Modal from '@containers/Modal';
import useBiometrics from '@hooks/useBiometrics';
import useDestroyWallet from '@hooks/useDestroyWallet';
import useThemeConfiguration from '@hooks/useThemeConfiguration';
import useWalletPublicValues from '@hooks/useWalletPublicValues';
import {
  BASE_ADDRESS_INDEX,
  ETH_DERIVATION_PATH,
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

const ConfigurationScreen = () => {
  const [closeWalletModalVisible, setCloseWalletModalVisible] = useState(false);

  const { t, i18n } = useTranslation();

  const { walletPublicValues } = useWalletPublicValues();
  const destroyWallet = useDestroyWallet();

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

  const canUseBiometrics = useMemo(deviceHasBiometrics, []);

  const languages = useMemo(() => Object.values(Languages).map((key) => ({
    label: t(`languages.${key}`),
    value: key,
    data: undefined,
  })), [i18n.language]);

  const toggleCloseWalletModal = (visible: boolean) => setCloseWalletModalVisible(visible);

  return (
    <>
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
          {walletPublicValues?.isHw && (
            <ConfigurationItem>
              <HwConnectionSelector label="main.configuration.labels.hwConnectionSelector" />
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
              onChange={(option) => i18n.changeLanguage(option.value)}
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
              derivationPath: `${ETH_DERIVATION_PATH}/${BASE_ADDRESS_INDEX}`,
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
            type='tertiary'
            text="common.cancel"
            onPress={() => toggleCloseWalletModal(false)}
          />
          <Button
            type='error'
            text="common.continue"
            onPress={destroyWallet}
          />
        </CloseWalletModalButtons>
      </Modal>
    </>
  );
};

export default ConfigurationScreen;