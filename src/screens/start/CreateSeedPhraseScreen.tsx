import React, { useMemo } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button, { ButtonType } from '@components/Button';
import Card from '@components/Card';
import Pill, { Type } from '@components/Pill';
import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';
import { createSeedPhrase } from '@web3/wallet';

const SeedPhraseCard = styled(Card).attrs({
  contentContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})`
  max-height: 350px;
`;

const WordPill = styled(Pill)`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 0px;
  margin: 0 ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)} 0;
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const MessageText = styled(Text)`
  text-align: center;
  margin: ${({ theme }) => theme.spacing(6)} 0;
  font-size: ${({ theme }) => theme.fonts.size[18]};
`;

type CreateSeedPhraseScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.createSeedPhrase>;

const CreateSeedPhraseScreen = ({ navigation }: CreateSeedPhraseScreenProps) => {
  const seedPhrase = useMemo(() => createSeedPhrase(true).split(' '), []);

  const onPressContinue = () => navigation.navigate(ScreenName.obtainAccess);

  return (
    <ScreenLayout
      title="access.createSeedPhrase.title"
      waitUntilNavigationFinish
      bigTitle
      hasFooterBanner
      scroll
    >
      <SeedPhraseCard
        scroll
        persistentScrollbar
      >
        {seedPhrase.map((word, index) => (
          <WordPill
            noI18n
            type={Type.INFO}
            text={`${index + 1}. ${word}`}
            key={`PILL_${index}_${word}`}
          />
        ))}
      </SeedPhraseCard>
      <MessageText text="access.createSeedPhrase.warningMessage" />
      <Button
        text="common.continue"
        onPress={onPressContinue}
        type={ButtonType.TERTIARY}
      />
    </ScreenLayout>
  );
};

export default CreateSeedPhraseScreen;
