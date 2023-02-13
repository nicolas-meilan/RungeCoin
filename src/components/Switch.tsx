import React from 'react';
import type {
  StyleProp,
  SwitchProps as SwitchPropsRN,
  ViewStyle,
} from 'react-native';

import styled, { useTheme } from 'styled-components/native';

import Text, { TextProps } from './Text';

type SwitchProps = SwitchPropsRN & {
  borderColor?: string;
  label?: string;
  i18nArgs?: TextProps['i18nArgs'];
  style?: StyleProp<ViewStyle>;
};

const SWITCH_WIDTH = 60;

const BaseWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SwitchWrapper = styled.View<{ color: string }>`
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ color }) => color};
  width: ${({ theme }) => SWITCH_WIDTH + theme.spacingNative(2)}px;
  height: ${({ theme }) => theme.inputsHeight.small};
  margin-Right: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
`;

const StyledSwitch = styled.Switch`
  flex: 1;
`;

const Label = styled(Text)<{ disabled?: boolean }>`
  ${({ disabled, theme }) => (disabled ? `color: ${theme.colors.disabled};` : '')}
`;
const Switch = ({
  onChange,
  label,
  i18nArgs,
  style,
  thumbColor: thumbColorProp,
  trackColor: trackColorProp,
  borderColor: borderColorProp,
  value = false,
  disabled = false,
}: SwitchProps) => {
  const theme = useTheme();

  const trackColor = trackColorProp || {
    false: theme.colors.disabled,
    true: disabled ? theme.colors.disabled : theme.colors.text.tertiary,
  };
  const thumbColor = disabled ? theme.colors.disabled : (thumbColorProp || theme.colors.info);
  const borderColor = disabled ? theme.colors.disabled : (borderColorProp || theme.colors.info);

  return (
    <BaseWrapper style={style}>
      <SwitchWrapper color={borderColor}>
        <StyledSwitch
          value={value}
          disabled={disabled}
          onChange={onChange}
          thumbColor={thumbColor}
          trackColor={trackColor}
        />
      </SwitchWrapper>
      {label && <Label disabled={disabled} text={label} i18nArgs={i18nArgs} />}
    </BaseWrapper>
  );
};

export default Switch;
