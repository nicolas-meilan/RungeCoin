import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  Modal as ModalRN,
  ModalProps as ModalRNProps,
  TouchableWithoutFeedback,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  BounceIn,
  BounceOut,
  runOnJS,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import Providers from './Providers';

const MODAL_HEIGHT = 300;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const ModalWrapper = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(4)};
  align-items: center;
  justify-content: center;
`;

const Content = styled(Animated.View) <{ isFullScreen: boolean }>`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.borderRadius};
  ${({ isFullScreen }) => (isFullScreen
    ? 'flex: 1'
    : `height: ${MODAL_HEIGHT}px`)};
`;

export type ModalProps = ModalRNProps & {
  isFullScreen?: boolean;
  onClose: () => void;
};

const Modal = ({
  children,
  onClose,
  visible,
  transparent = false,
  isFullScreen = false,
  ...props
}: ModalProps) => {
  const [visibleAnimationModal, setVisibleAnimationModal] = useState(visible);

  useEffect(() => {
    if (visible) setVisibleAnimationModal(true);
  }, [visible]);

  useFocusEffect(useCallback(() => () => {
    setVisibleAnimationModal(false);

    onClose(); // Execute on blur
  }, []));

  if (transparent) {
    return (
      <ModalRN
        transparent
        onRequestClose={onClose}
        visible={visible}
        {...props}
      >
        <Providers>
          {children}
        </Providers>
      </ModalRN>
    );
  }

  const onFinishCloseAnimation = (finished: boolean) => {
    'worklet';

    if (finished) runOnJS(setVisibleAnimationModal)(false);
  };

  return (
    <ModalRN
      {...props}
      transparent
      onRequestClose={onClose}
      animationType="none"
      visible={visibleAnimationModal}
    >
      <Providers>
        <ModalWrapper>
          <TouchableWithoutFeedback onPress={onClose}>
            <Overlay />
          </TouchableWithoutFeedback>
          {visible && (
            <Content
              isFullScreen={isFullScreen}
              entering={BounceIn}
              exiting={BounceOut.withCallback(onFinishCloseAnimation)}
            >
              {children}
            </Content>
          )}
        </ModalWrapper>
      </Providers>
    </ModalRN>
  );
};

export default Modal;
