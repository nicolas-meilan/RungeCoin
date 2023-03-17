import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';

import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const BASE_TOP_MARGIN = 150;
const RADIUS = 30;
const ANIMATION_DURATION = 700;
const SWIPE_TO_CLOSE = 0.30;

type Children = false | JSX.Element;

type BottomSheetProps = {
  visible?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  children: Children | Children[];
  topMargin?: number;
  animationDuration?: number;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
};

const Overlay = styled.View <{
  height: number;
  width: number;
}>`
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
`;

const BottomSheetContainer = styled(Animated.View) <{
  height: number;
  width: number;
}>`
  position: absolute;
  bottom: 0;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  border-top-left-radius: ${RADIUS}px;
  border-top-right-radius: ${RADIUS}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Top = styled.View`
  width: 100%;
  height: ${({ theme }) => theme.inputsHeight.small};
  align-items: center;
  justify-content: center;
`;

const TopLine = styled.View`
  width: 20%;
  height: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.text.primary};
`;

const Content = styled(SafeAreaView)`
  flex: 1;
`;

const ChildrenWrapper = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`
  flex: 1;
`;

const BottomSheetContent = ({
  onOpen,
  onClose,
  children,
  onOpenAnimationEnd,
  onCloseAnimationEnd,
  topMargin = BASE_TOP_MARGIN,
  animationDuration = ANIMATION_DURATION,
  visible = false,
}: BottomSheetProps) => {
  const [neverWasVisible, setNeverWasVisible] = useState(true);
  const [canShow, setCanShow] = useState(false);

  const { height, width } = useWindowDimensions();
  const bottomSheetHeight = height - topMargin;

  const bottomSheetVisibleY = 0;
  const bottomSheetNotVisibleY = bottomSheetHeight;

  const currentY = useSharedValue(bottomSheetNotVisibleY);
  const initialGetureY = useSharedValue(currentY.value);
  const animationInProgress = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: currentY.value }],
  }));

  const toggleCanShow = (newCanShow: boolean, executeOnClose?: boolean) => {
    if (newCanShow) Keyboard.dismiss();
    if (!newCanShow && executeOnClose) onClose?.();

    setCanShow(newCanShow);
  };

  const toggleBottomSheet = (show: boolean, executeOnClose?: boolean) => {
    'worklet';

    if (animationInProgress.value) return;

    animationInProgress.value = true;
    if (show) runOnJS(toggleCanShow)(true);

    const onAnimationFinish = (isFinished?: boolean) => {
      'worklet';

      const isHide = currentY.value === bottomSheetNotVisibleY;
      const isVisible = currentY.value === bottomSheetVisibleY;

      if (isFinished && (isHide || isVisible)) {
        animationInProgress.value = false;
      }

      if (isFinished && isHide) {
        runOnJS(toggleCanShow)(false, executeOnClose);
        if (onCloseAnimationEnd) runOnJS(onCloseAnimationEnd)();
      }

      if (isFinished && isVisible && onOpenAnimationEnd) runOnJS(onOpenAnimationEnd)();
    };

    currentY.value = withTiming(show
      ? bottomSheetVisibleY
      : bottomSheetNotVisibleY, {
      duration: animationDuration,
    }, onAnimationFinish);
  };

  useEffect(() => {
    if (visible) {
      setNeverWasVisible(false);
      toggleBottomSheet(true);
      onOpen?.();
      return;
    }

    if (!neverWasVisible) {
      toggleBottomSheet(false);
      onClose?.();
    }
  }, [visible]);

  if (!canShow) return null;

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      if (animationInProgress.value) {
        initialGetureY.value = -1;
        return;
      }

      initialGetureY.value = event.absoluteY;
    })
    .onUpdate((event) => {
      const avoidChanges = animationInProgress.value || initialGetureY.value < 0;
      if (avoidChanges) return;

      const newY = event.absoluteY - initialGetureY.value;
      const overflow = newY <= bottomSheetVisibleY;

      currentY.value = overflow ? bottomSheetVisibleY : newY;
    })
    .onFinalize((event) => {
      const avoidChanges = animationInProgress.value || initialGetureY.value < 0;
      if (avoidChanges) return;

      const finalY = event.absoluteY - initialGetureY.value;
      const hideBottomSheet = finalY >= bottomSheetNotVisibleY * SWIPE_TO_CLOSE;
      toggleBottomSheet(!hideBottomSheet, hideBottomSheet);
    });

  return (
    <>
      <TouchableWithoutFeedback onPress={() => toggleBottomSheet(false, true)}>
        <Overlay
          width={width}
          height={height}
        />
      </TouchableWithoutFeedback>
      <GestureDetector gesture={gesture}>
        <BottomSheetContainer
          width={width}
          height={bottomSheetHeight}
          style={animatedStyle}
        >
          <Content>
            <Top>
              <TopLine />
            </Top>
            <ChildrenWrapper>
              {children}
            </ChildrenWrapper>
          </Content>
        </BottomSheetContainer>
      </GestureDetector>
    </>
  );
};

const BottomSheet = ({
  onOpen,
  onCloseAnimationEnd,
  visible,
  ...props
}: BottomSheetProps) => {
  const [canShow, setCanShow] = useState(visible);

  const handleOpen = () => {
    setCanShow(true);
    onOpen?.();
  };

  const handleCloseAnimationEnd = () => {
    setCanShow(false);
    onCloseAnimationEnd?.();
  };

  return (
    <Modal
      visible={visible || canShow}
      animationType="none"
      transparent
      hardwareAccelerated
    >
      <StyledGestureHandlerRootView>
        <BottomSheetContent
          onOpen={handleOpen}
          onCloseAnimationEnd={handleCloseAnimationEnd}
          visible={visible}
          {...props}
        />
      </StyledGestureHandlerRootView>
    </Modal>
  );
};

export default BottomSheet;
