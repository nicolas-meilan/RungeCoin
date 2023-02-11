import React, { useMemo, useRef, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import congrats from '@assets/images/congratsPerson.svg';
import keyAndLock from '@assets/images/keyAndLock.svg';
import wallet from '@assets/images/wallet.svg';
import Button, { ButtonType } from '@components/Button';
import Carousel, { CarouselRef } from '@components/Carousel';
import Message from '@components/Message';
import ScreenLayout from '@components/ScreenLayout';
import { ScreenName } from '@navigation/constants';
import { StartNavigatorType } from '@navigation/StartNavigator';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

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

  const carouselItems = useMemo(() => [(
    <Message text="access.startGuide.guide1" svg={wallet} />
  ), (
    <Message text="access.startGuide.guide2" svg={keyAndLock} />
  ), (
    <Message text="access.startGuide.guide3" svg={congrats} />
  )], []);

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