import React from 'react';
import { View, ViewProps } from 'react-native';

import type { SvgProps as RnSvgProps } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

type BaseSvg = React.FC<RnSvgProps>;

type BaseSvgProps = {
  size?: string | number;
  align?: 'center';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: RnSvgProps['strokeLinecap'];
  strokeLinejoin?: RnSvgProps['strokeLinejoin'];
  preserveAspectRatio?: string;
  aspectRatio?: number;
  color?: string;
} & ViewProps;

export type SvgProps = BaseSvgProps & { svg: BaseSvg };

const Svg = ({
  svg: SVG,
  size,
  align,
  style,
  fill,
  stroke,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
  aspectRatio = 1,
  preserveAspectRatio,
  color,
  ...rest
}: SvgProps) => {
  const theme = useTheme();

  // Workaround for Jest
  if (typeof SVG === 'number') return <View testID={rest.testID} />;

  const svgFill = fill;
  const svgStroke = stroke;

  const content = (
    <View
      style={[{ width: size, aspectRatio }, style]}
      {...rest}
    >
      <SVG
        width="100%"
        height="100%"
        preserveAspectRatio={preserveAspectRatio || 'xMidYMid meet'}
        fill={svgFill}
        stroke={svgStroke}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        color={color || theme.colors.text.primary}
      />
    </View>
  );

  if (align) {
    const alignStyle = {
      width: '100%',
      alignItems: align,
    };
  
    return <View style={alignStyle}>{content}</View>;
  }

  return content;
};

export default Svg;