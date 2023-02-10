import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button, { ButtonType } from '@components/Button';
import Carousel from '@components/Carousel';
import ScreenLayout from '@components/ScreenLayout';
import Text from '@components/Text';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const Item = styled.View`
  flex: 1;
  border: 1px solid red;
`;

const ItemText = styled(Text)``;

type StartGuideScreenProps = NativeStackScreenProps<StartNavigatorType, ScreenName.startGuide>;

const StartGuideScreen = ({ navigation }: StartGuideScreenProps) => {
  const goToAccess = () => navigation.navigate(ScreenName.requestSeedPhrase);
  const goToCreate = () => navigation.navigate(ScreenName.createSeedPhrase);

  const carouselItems = [(
    <Item>
      <ItemText text='hola' />
    </Item>
  ), (
    <Item>
      <ItemText text='hola2' />
    </Item>
  ), (
    <Item>
      <ItemText text='hola3' />
    </Item>
  )];

  return (
    <ScreenLayout
      title="access.startGuide.title"
      hasBack={false}
      bigTitle
      hasFooterBanner
    >
      <Carousel items={carouselItems} auto loop/>
      <StyledButton text="access.startGuide.accessToYourWallet" onPress={goToAccess} />
      <StyledButton text="access.startGuide.createNewWallet" onPress={goToCreate} type={ButtonType.TERTIARY} />
    </ScreenLayout>
  );
};

export default StartGuideScreen;