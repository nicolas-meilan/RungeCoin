import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { IconProps as IconPropsRN } from 'react-native-vector-icons/Icon';
import IconRN from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';

type IconProps = IconPropsRN & {
  onPress?: () => void;
};


const StyledIcon = styled(IconRN)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size[32]};
`;

const Icon = ({ onPress, ...props }: IconProps) => {
  const iconComponent = (
    <StyledIcon {...props} />
  );

  if (!onPress) return iconComponent;

  return (
    <TouchableOpacity onPress={onPress}>
      {iconComponent}
    </TouchableOpacity>
  );
};

export default Icon;
