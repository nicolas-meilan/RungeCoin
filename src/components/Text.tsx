import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import styled from 'styled-components/native';

const ANIMATION_TIME = 100;
const BOLD_SYMBOL = '**';

export enum Weight {
  REGULAR = 'normal',
  BOLD = 'bold',
}

export type TextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  boldTextStyle?: StyleProp<TextStyle>;
  children?: JSX.Element | JSX.Element[];
  weight?: Weight;
  i18nArgs?: { [key: string]: string | number | undefined };
  onPress?: () => void;
  disabled?: boolean;
  noI18n?: boolean;
  usesFormat?: boolean;
};

const StyledText = styled(Animated.Text)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size[14]};
`;

const Text = ({
  text: textProp = '',
  children,
  style,
  onPress,
  weight = Weight.REGULAR,
  boldTextStyle,
  i18nArgs = {},
  disabled = false,
  noI18n = false,
  usesFormat = true,
}: TextProps) => {
  const { t } = useTranslation();

  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const toggleOpacity = (show: boolean) => {
    if (!onPress) return;
    opacity.value = withTiming(show ? 1 : 0.5, { duration: ANIMATION_TIME });
  };

  const onPressIn = () => {
    toggleOpacity(false);
  };

  const onPressOut = () => {
    toggleOpacity(true);
  };

  if (children) return (
    <StyledText
      style={[{ fontWeight: weight }, style, animatedStyle]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      {children}
    </StyledText>
  );

  const text = noI18n ? textProp : t(textProp, i18nArgs);

  if (usesFormat && weight !== Weight.BOLD) {
    const splittedText = text.split(BOLD_SYMBOL);
    const weightForIndex = (index: number) => (index % 2 !== 0 ? Weight.BOLD : weight);
    const getStyleForIndex = (index: number) => (index % 2 !== 0 ? boldTextStyle : undefined);

    return (
      <StyledText
        style={[{ fontWeight: weight }, style, animatedStyle]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={disabled}
      >
        {splittedText.map((currentText, index) => (
          <StyledText
            key={`TEXT_${currentText}_${index}`}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            style={[{ fontWeight: weightForIndex(index) }, style, getStyleForIndex(index), animatedStyle]}
          >
            {currentText}
          </StyledText>
        ))}
      </StyledText>
    );
  }

  return (
    <StyledText
      style={[{ fontWeight: weight }, style, animatedStyle]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
    >
      {text}
    </StyledText>
  );
};

export default Text;