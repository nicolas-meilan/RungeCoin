import React, { ForwardedRef } from 'react';
import { TouchableOpacity } from 'react-native';

import type { IconProps as IconPropsRN } from 'react-native-vector-icons/Icon';
import IconRN from 'react-native-vector-icons/MaterialCommunityIcons';
import styled, { useTheme } from 'styled-components/native';

type IconProps = IconPropsRN & {
  hitSlop?: number;
};

const StyledIcon = styled(IconRN)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size[32]};
`;

const Icon = React.forwardRef(({
  onPress,
  disabled,
  style,
  hitSlop,
  ...props
}: IconProps,
ref: ForwardedRef<IconRN>) => {
  const theme = useTheme();

  const disabledStyle = disabled ? {
    color: theme.colors.disabled,
  } : {};

  const iconComponent = (
    <StyledIcon
      {...props}
      ref={ref}
      style={[style, disabledStyle]}
      maxFontSizeMultiplier={1}
    />
  );

  if (!onPress) return iconComponent;

  const hitSlopObj = hitSlop ? {
    top: hitSlop, right: hitSlop, bottom: hitSlop, left: hitSlop,
  } : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlopObj}
    >
      {iconComponent}
    </TouchableOpacity>
  );
});

export default Icon;
