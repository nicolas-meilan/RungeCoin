import React from 'react';
import { useWindowDimensions } from 'react-native';

import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

const GradientWrapper = styled.View<{
  height: number;
  width: number;
}>`
  position: absolute;
  height: ${({ width }) => width}px
  height: ${({ height }) => height}px
`;

const BackgrounGradient = () => {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();

  return (
    <GradientWrapper height={height} width={width}>
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
