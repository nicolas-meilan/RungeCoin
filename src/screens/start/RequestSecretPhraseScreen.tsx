import React from 'react';
import { Button } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AvailableThemes } from '../../theme/themes';
import ScreenLayout from '@components/ScreenLayout';
import useTheme from '@hooks/useTheme';
import ScreenName from '@navigation/screenName';

const RequestSecretPhraseScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { setThemeMode, themeMode } = useTheme();

  return (
    <ScreenLayout>
      <Button title={t('common.test')} onPress={() => navigation.navigate(ScreenName.createSecretPhrase)} />
      <Button title={t('common.test2')} onPress={() => setThemeMode(themeMode === AvailableThemes.LIGHT ? AvailableThemes.DARK : AvailableThemes.LIGHT)} />
    </ScreenLayout>
  );
};

export default RequestSecretPhraseScreen;
