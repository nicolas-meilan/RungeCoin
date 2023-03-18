import React, { useState } from 'react';
import type {
  TextInputProps as TextInputPropsRN,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import Svg, { SvgProps } from './Svg';
import Text, { TextProps } from './Text';

export enum TextInputType {
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXT = 'text',
}

export type TextInputProps = TextInputPropsRN & {
  label?: string;
  icon?: string;
  type?: string;
  error?: boolean;
  borderColor?: string;
  onPressIcon?: () => void;
  onPress?: () => void;
  errorI18nArgs?: TextProps['i18nArgs'];
  errorMessage?: string;
  leftSvg?: SvgProps['svg'];
  leftComponent?: React.ReactNode;
};

const Wrapper = styled.TouchableOpacity``;

const InputWrapper = styled.View<{ color: string; multiline?: boolean }>`
  flex-direction: row;
  width: 100%;
  border: 1px solid ${({ color }) => color};
  border-radius: ${({ theme }) => theme.borderRadius};
  align-items: center;
  padding: ${({ multiline, theme }) => (multiline
    ? theme.spacing(2)
    : `0 ${theme.spacing(2)}`)};
  height: ${({ theme, multiline }) => multiline ? theme.inputsHeight.big : theme.inputsHeight.small}
`;

const Label = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledIcon = styled(Icon)`
  font-size: ${({ theme }) => theme.fonts.size[24]};
`;

const IconWrapper = styled.View<{ multiline?: boolean }>`
  flex: 0.1;
  align-items: center;
  justify-content: ${({ multiline }) => (multiline ? 'flex-end' : 'center')};
`;

const StyledTextInput = styled.TextInput<{
  hasSvg?: boolean;
}>`
  margin-left: ${({ hasSvg, theme }) => hasSvg ? theme.spacing(1) : '0px'};
  vertical-align: ${({ multiline }) => (multiline ? 'top' : 'middle')};
  font-size: ${({ multiline, theme }) => theme.fonts.size[multiline ? 20 : 16]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size[16]};
  flex: 1;
`;

const ErrorMessage = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fonts.size[12]};
`;

const TextInput = ({
  label,
  placeholder,
  onFocus,
  onBlur,
  icon,
  onPressIcon,
  style,
  errorMessage,
  errorI18nArgs,
  multiline,
  onPress,
  leftSvg,
  leftComponent,
  borderColor: borderColorProp,
  type = TextInputType.TEXT,
  error = false,
  ...props
}: TextInputProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const isPassword = type === TextInputType.PASSWORD;

  const [baseBorderColor, setBaseBorderColor] = useState(theme.colors.border);
  const [showText, setShowText] = useState(!isPassword);

  const inputPH = placeholder ? t(placeholder) : '';
  const passwordIconName = showText ? 'eye-outline' : 'eye-off-outline';
  const borderColor = error
    ? theme.colors.error
    : (borderColorProp || baseBorderColor);
  const renderError = error && !!errorMessage;

  const handleOnFocus = (nativeEvent: NativeSyntheticEvent<TextInputFocusEventData>) => {
    onFocus?.(nativeEvent);
    setBaseBorderColor(theme.colors.primary);
  };

  const handleOnBlur = (nativeEvent: NativeSyntheticEvent<TextInputFocusEventData>) => {
    onBlur?.(nativeEvent);
    setBaseBorderColor(theme.colors.border);
  };

  const toggleShowText = () => {
    onPressIcon?.();
    setShowText(!showText);
  };

  const renderLeftComponent = !!(leftComponent || leftSvg);

  const left = leftComponent || <Svg svg={leftSvg} size={24} />;

  return (
    <Wrapper
      style={style}
      onPress={onPress}
      disabled={!onPress}
    >
      {!!label && <Label text={label} />}
      <InputWrapper color={borderColor} multiline={multiline}>
        {renderLeftComponent && left}
        <StyledTextInput
          hasSvg={!!leftSvg}
          cursorColor={theme.colors.primary}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
          placeholder={inputPH}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          secureTextEntry={!showText}
          multiline={multiline}
        />
        <IconWrapper multiline={multiline}>
          {isPassword && <StyledIcon name={passwordIconName} onPress={toggleShowText} />}
          {icon && !isPassword && <StyledIcon name={icon} onPress={onPressIcon} />}
        </IconWrapper>
      </InputWrapper>
      {renderError && <ErrorMessage text={errorMessage} i18nArgs={errorI18nArgs} />}
    </Wrapper>
  );
};

export default TextInput;
