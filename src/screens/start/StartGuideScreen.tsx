import React, { useRef, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import Button, { ButtonType } from '@components/Button';
import Carousel, { CarouselRef } from '@components/Carousel';
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
  const carouselRef = useRef<CarouselRef>(null);

  const [guideFinish, setGuideFinish] = useState(false);

  const onFinishCarousel = () => setGuideFinish(true);

  const goNext = () => {
    if (guideFinish) {
      navigation.navigate(ScreenName.createSeedPhrase);
      return;
    }

    carouselRef?.current?.next();
  };

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
      <Carousel
        ref={carouselRef}
        items={carouselItems}
        onRenderLastItem={onFinishCarousel}
      />
      <StyledButton
        text={`common.${guideFinish ? 'continue' : 'next'}`}
        onPress={goNext}
        type={ButtonType.TERTIARY}
      />
    </ScreenLayout>
  );
};

export default StartGuideScreen;