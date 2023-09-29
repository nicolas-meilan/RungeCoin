import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import styled from 'styled-components/native';

import Icon from './Icon';
import Text from './Text';

const BUTTONS_SIZE = 50;

export const DELETE_BUTTON = 'x';
const DECIMAL_BUTTON = 'number.decimalSeparator';
const KEYBOARD_BUTTONS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  DECIMAL_BUTTON, '0', DELETE_BUTTON,
];

type NumericKeyboardProps = {
  allowDecimals?: boolean;
  onTouchStart?: (key: typeof KEYBOARD_BUTTONS[number]) => void;
  onTouchEnd?: () => void;
  style?: StyleProp<ViewStyle>;
};

const Keyboard = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ButtonWrapper = styled.View`
  width: ${100 / 3}%;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  align-items: center;
  justify-content: center;
`;

const KeyboardButton = styled.View`
  width: ${BUTTONS_SIZE}px;
  height: ${BUTTONS_SIZE}px;
  border-radius: ${BUTTONS_SIZE / 2}px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const DeleteIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.primary};
`;

const KeyboardButtonText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[28]};
  color: ${({ theme }) => theme.colors.primary};
`;

const TouchableWrapper = styled.TouchableOpacity``;

const DeleteIconWrapper = styled.View``;

const NumericKeyboard = ({
  onTouchStart,
  onTouchEnd,
  style,
  allowDecimals = true,
}: NumericKeyboardProps) => {

  const decimalButton = (key: typeof KEYBOARD_BUTTONS[number]) => (
    allowDecimals ? (
      <TouchableWrapper>
        <KeyboardButton
          onTouchStart={() => onTouchStart?.(key)}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <KeyboardButtonText text={key} />
        </KeyboardButton>
      </TouchableWrapper>
    ) : <></>
  );

  return (
    <Keyboard style={style}>
      {KEYBOARD_BUTTONS.map((key) => (
        <ButtonWrapper key={`KEYBOARD_${key}`}>
          {key === DECIMAL_BUTTON && decimalButton(key)}
          {key === DELETE_BUTTON && (
            <DeleteIconWrapper
              onTouchStart={() => onTouchStart?.(key)}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              <DeleteIcon
                name="backspace-outline"
                hitSlop={BUTTONS_SIZE / 2}
                onPress={() => { }} // I need the touchable feedback
              />
            </DeleteIconWrapper>
          )}
          {key !== DELETE_BUTTON && key !== DECIMAL_BUTTON && (
            <TouchableWrapper>
              <KeyboardButton
                onTouchStart={() => onTouchStart?.(key)}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
              >
                <KeyboardButtonText text={key} />
              </KeyboardButton>
            </TouchableWrapper>
          )}
        </ButtonWrapper>
      ))}
    </Keyboard>
  );
};

export default NumericKeyboard;
