import React from 'react';
import type {
  StyleProp,
  TextStyle,
  TextProps as TextPropsRN,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

const ANIMATION_TIME = 100;
const BOLD_SYMBOL = '**';
const LINK_SYMBOL = '__';

type Weight = 'normal' | 'bold';

export type TextProps = TextPropsRN & {
  text: string;
  style?: StyleProp<TextStyle>;
  boldTextStyle?: StyleProp<TextStyle>;
  linkTextStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  weight?: Weight;
  hasLinks?: boolean;
  i18nArgs?: { [key: string]: string | number | undefined };
  onPress?: () => void;
  disabled?: boolean;
  noI18n?: boolean;
  useFormat?: boolean;
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
  weight = 'normal',
  boldTextStyle,
  linkTextStyle = {},
  i18nArgs = {},
  disabled = false,
  noI18n = false,
  useFormat = true,
  hasLinks = false,
  ...props
}: TextProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
      {...props}
    >
      {children}
    </StyledText>
  );

  const text = noI18n ? textProp : t(textProp, i18nArgs);

  if (useFormat) {
    const splittedText = text.split(hasLinks ? LINK_SYMBOL : BOLD_SYMBOL);

    const weightForIndex = (index: number) => {
      if (hasLinks) return weight;

      return index % 2 !== 0 ? 'bold' : weight;
    };

    const getStyleForIndex = (index: number) => {
      const styleForSpecialText = hasLinks ? {
        color: theme.colors.info,
        textDecorationLine: 'underline',
        ...(linkTextStyle as object),
      } as StyleProp<TextStyle> : boldTextStyle;

      return index % 2 !== 0 ? styleForSpecialText : undefined;
    };

    return (
      <StyledText
        style={[{ fontWeight: weight }, style, animatedStyle]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={disabled}
        {...props}
      >
        {splittedText.map((currentText, index) => (
          <StyledText
            key={`TEXT_${currentText}_${index}`}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            style={[{ fontWeight: weightForIndex(index) }, style, getStyleForIndex(index), animatedStyle]}
            {...props}
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
      maxFontSizeMultiplier={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {text}
    </StyledText>
  );
};

export default Text;