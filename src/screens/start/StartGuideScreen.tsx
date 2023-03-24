import React, { useMemo, useRef, useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styled from 'styled-components/native';

import congrats from '@assets/images/congratsPerson.png';
import keyAndLock from '@assets/images/keyAndLock.png';
import wallet from '@assets/images/wallet.png';
import Button from '@components/Button';
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

  const carouselItems = useMemo(() => [{
    key: 'access.startGuide.guide1',
    component: <Message text="access.startGuide.guide1" image={wallet} />,
  }, {
    key: 'access.startGuide.guide2',
    component: <Message text="access.startGuide.guide2" image={keyAndLock} />,
  }, {
    key: 'access.startGuide.guide3',
    component: <Message text="access.startGuide.guide3" image={congrats} />,
  },
  ], []);

  return (
    <ScreenLayout
      title="access.startGuide.title"
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
        type="tertiary"
      />
    </ScreenLayout>
  );
};

export default StartGuideScreen;