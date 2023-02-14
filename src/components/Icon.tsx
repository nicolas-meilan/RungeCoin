import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { IconProps as IconPropsRN } from 'react-native-vector-icons/Icon';
import IconRN from 'react-native-vector-icons/MaterialCommunityIcons';
import styled, { useTheme } from 'styled-components/native';

type IconProps = IconPropsRN;

const StyledIcon = styled(IconRN)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size[32]};
`;

const Icon = ({
  onPress,
  disabled,
  style,
  ...props
}: IconProps) => {
  const theme = useTheme();

  const disabledStyle = disabled ? {
    color: theme.colors.disabled,
  } : {};

  const iconComponent = (
    <StyledIcon {...props} style={[style, disabledStyle]} />
  );

  if (!onPress) return iconComponent;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      {iconComponent}
    </TouchableOpacity>
  );
};

export default Icon;
