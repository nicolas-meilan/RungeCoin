import React, { useEffect, useMemo, useState } from 'react';

import EncryptedStorage from 'react-native-encrypted-storage';
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import NumericKeyboard, { DELETE_BUTTON } from './NumericKeyboard';
import { Spacer } from './Spacer';
import Text from './Text';
import Title from './Title';
import BottomSheet from '@containers/Bottomsheet';
import useDestroyWallet from '@hooks/useDestroyWallet';
import StorageKeys from '@system/storageKeys';

const PIN_LENGTH = 6;
const MAX_PIN_ATTEMPS = 5;

const DOT_SIZE = 32;
const TOP_MARGIN = 50;
const DOT_ANIMATION_DURATION = 500;
const BOTTOMSHEET_ANIMATION_DURATION = 1000;

type PinProps = {
  onClose?: () => void;
  visible?: boolean;
  onPinEntered: (pin: string) => (boolean | void) | Promise<boolean | void>;
  title?: string;
  validatePinAttemps?: boolean;
  showCustomError?: boolean;
  customErrorMessage?: string;
  onBack?: () => void;
  hasBack?: boolean;
};

const Wrapper = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const Resizable = styled.View`
  flex-shrink: 1;
  flex-grow: 1;
`;

const DotsWrapper = styled.View`
  justify-content: space-between;
  flex-direction: row;
  width: ${({ theme }) => (DOT_SIZE + theme.spacingNative(2)) * PIN_LENGTH}px;
  align-self: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ErrorText = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
`;

const StyledTitle = styled(Title)`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

type DotProps = {
  fill?: boolean;
};

const MainDot = styled.View`
  overflow: hidden;
  width: ${DOT_SIZE}px;
  height: ${DOT_SIZE}px;
  border-radius: ${DOT_SIZE / 2}px;
  padding: ${({ theme }) => theme.spacing(1)};
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

const DotContent = styled(Animated.View)`
  border-radius: ${DOT_SIZE / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  height: 100%;
`;

const BackIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.primary};
  width: ${({ theme }) => theme.spacing(8)};
`;

const VoidLeftHeader = styled.View`
  width: ${({ theme }) => theme.spacing(8)};
`;

const Header = styled.View`
  flex-direction: row;
`;

const TitleWrapper = styled.View`
  justify-content: center;
  flex: 1;
`;


const Dot = ({
  fill,
}: DotProps) => (
  <MainDot>
    {fill && (
      <DotContent
        entering={BounceIn.duration(DOT_ANIMATION_DURATION)}
        exiting={BounceOut.duration(DOT_ANIMATION_DURATION)}
      />
    )}
  </MainDot>
);

const Pin = ({
  onPinEntered,
  onClose,
  title = '',
  onBack,
  hasBack = false,
  validatePinAttemps = true,
  showCustomError = false,
  customErrorMessage = '',
  visible = false,
}: PinProps) => {
  const theme = useTheme();

  const destroyWallet = useDestroyWallet();

  const [pinAttemps, setPinAttemps] = useState(0);
  const [pin, setPin] = useState('');

  const savePinAttemps = async (newPinAttemps: number) => {
    setPinAttemps(newPinAttemps);
    await EncryptedStorage.setItem(StorageKeys.PIN_ATTEMPS, newPinAttemps.toString());
  };

  const pinIsFull = useMemo(() => pin.length === PIN_LENGTH, [pin]);

  const onChangePin = (newKey: string) => {
    if (newKey === DELETE_BUTTON) {
      setPin((currentPin: string) => currentPin.slice(0, -1));
      return;
    }

    if (pinIsFull) return;

    setPin((currentPin: string) => `${currentPin}${newKey}`);
  };

  const handleClose = () => {
    setPin('');
    onClose?.();
  };

  useEffect(() => {
    if (!validatePinAttemps) return;

    EncryptedStorage.getItem(StorageKeys.PIN_ATTEMPS)
      .then((newPinAttemps) => (
        setPinAttemps(parseInt(newPinAttemps || '0', 10))
      ));
  }, []);

  const onPinFull = async () => {
    if (pinIsFull) {
      const isValidPin = await onPinEntered(pin);
      setPin('');
      if (!validatePinAttemps) return;

      savePinAttemps(isValidPin ? 0 : pinAttemps + 1);
    }
  };

  useEffect(() => {
    onPinFull();
  }, [pinIsFull]);

  const dots = useMemo(() => [...new Array(PIN_LENGTH)].map((_, index) => (
    <Dot
      fill={index + 1 <= pin.length}
      key={`PIN_DOT_${index}`}
    />
  )), [pin]);

  const remainingAttemps = useMemo(() => MAX_PIN_ATTEMPS - pinAttemps, [pinAttemps]);

  useEffect(() => {
    if (!remainingAttemps) destroyWallet();
  }, [remainingAttemps]);

  const handleBack = () => {
    setPin('');
    onBack?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      topMargin={TOP_MARGIN}
      animationDuration={BOTTOMSHEET_ANIMATION_DURATION}
    >
      <Wrapper>
        <Resizable>
          <Header>
            {hasBack && <BackIcon name="chevron-left" onPress={handleBack} />}
            {!!title && <TitleWrapper><StyledTitle title={title} isSubtitle /></TitleWrapper>}
            {hasBack && <VoidLeftHeader />}
          </Header>
          <Spacer size={theme.spacingNative(12)} />
          <DotsWrapper>
            {dots}
          </DotsWrapper>
          {validatePinAttemps && remainingAttemps < MAX_PIN_ATTEMPS && (
            <ErrorText text="main.pin.pinError" i18nArgs={{ remainingAttemps }} />
          )}
          {showCustomError && !!customErrorMessage && (
            <ErrorText text={customErrorMessage} />
          )}
          <Spacer fill />
          <NumericKeyboard
            allowDecimals={false}
            onTouchStart={onChangePin}
          />
        </Resizable>
      </Wrapper>
    </BottomSheet>
  );
};

export default Pin;
