import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import styled from 'styled-components/native';

import Icon from './Icon';
import Text from './Text';

type CheckboxProps = {
  value?: boolean;
  onChange?: () => void;
  onPressText?: () => void;
  label?: string;
  textHasLinks?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CHECKBOX_SIZE = 25;
const ANIMATION_TIME = 200;

const BaseWrapper = styled.View`
  align-items: center;
  flex-direction: row;
`;

const CheckboxWrapper = styled.TouchableOpacity`
  width: ${CHECKBOX_SIZE}px;
  height: ${CHECKBOX_SIZE}px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  overflow: hidden;
`;

const SelectedAnimatedContent = styled(Animated.View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const CheckboxIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.text.inverted};
  font-size: ${({ theme }) => theme.fonts.size[20]};
`;

const CheckboxLabel = styled(Text)`
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const Checkbox = ({
  onChange,
  onPressText,
  style,
  textHasLinks = false,
  label = '',
  value = false,
}: CheckboxProps) => {

  return (
    <BaseWrapper style={style}>
      <CheckboxWrapper onPress={onChange}>
        {value && (
          <SelectedAnimatedContent
            entering={FadeIn.duration(ANIMATION_TIME)}
            exiting={FadeOut.duration(ANIMATION_TIME)}
          >
            <CheckboxIcon name="check" />
          </SelectedAnimatedContent>
        )}
      </CheckboxWrapper>
      {!!label && <CheckboxLabel text={label} onPress={onPressText} hasLinks={textHasLinks} />}
    </BaseWrapper>
  );
};

export default Checkbox;
