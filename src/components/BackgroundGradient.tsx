import React from 'react';

import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

const GradientWrapper = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const BackgrounGradient = () => {
  const theme = useTheme();

  return (
    <GradientWrapper>
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient
            id="grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="80%"
            y2="50%"
          >
            <Stop offset="0" stopColor={theme.colors.secondary} />
            <Stop offset="1" stopColor={theme.colors.background.primary} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>
    </GradientWrapper>
  );
};

export default BackgrounGradient;
