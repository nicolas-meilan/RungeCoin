import React from 'react';
import { Button } from 'react-native';

import { useTranslation } from 'react-i18next';

import ScreenLayout from '@components/ScreenLayout';
import ScreenName from '@navigation/screenName';

const RequestSecretPhraseScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  return (
    <ScreenLayout>
      <Button title={t('common.test')} onPress={() => navigation.navigate(ScreenName.createSecretPhrase)} />
    </ScreenLayout>
  );
};

export default RequestSecretPhraseScreen;
