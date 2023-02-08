import React, { useState } from 'react';
import type {
  TextInputProps as TextInputPropsRN,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import Text from './Text';

export enum TextInputType {
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXT = 'text',
}

type TextInputProps = TextInputPropsRN & {
  label?: string;
  icon?: string;
  type?: string;
  error?: boolean;
  onPressIcon?: () => void;
  errorMessage?: string;
};

const Wrapper = styled.View``;

const InputWrapper = styled.View<{ color: string; multiline?: boolean }>`
  flex-direction: row;
  width: 100%;
  border: 1px solid ${({ color }) => color};
  border-radius: ${({ theme }) => theme.borderRadius};
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

const StyledTextInput = styled.TextInput<{ hasIcon?: boolean }>`
  vertical-align: ${({ multiline }) => (multiline ? 'top' : 'middle')};
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
  multiline,
  type = TextInputType.TEXT,
  error = false,
  ...props
}: TextInputProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const isPassword = type === TextInputType.PASSWORD;

  const [baseBorderColor, setBaseBorderColor] = useState(theme.colors.border);
  const [showText, setShowText] = useState(!isPassword);

  const hasIcon = !!icon || isPassword;
  const inputPH = placeholder ? t(placeholder) : '';
  const passwordIconName = showText ? 'eye-outline' : 'eye-off-outline';
  const borderColor = error ? theme.colors.error : baseBorderColor;
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


  return (
    <Wrapper style={style}>
      {!!label && <Label text={label} />}
      <InputWrapper color={borderColor} multiline={multiline}>
        <StyledTextInput
          cursorColor={theme.colors.primary}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
          hasIcon={hasIcon}
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
      {renderError && <ErrorMessage text={errorMessage} />}
    </Wrapper>
  );
};

export default TextInput;
