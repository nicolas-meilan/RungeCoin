import React, { useState } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import {
  SvgUri,
  SvgProps as RnSvgProps,
} from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

import Skeleton from './Skeleton';

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
  viewBox?: string;
  color?: string;
  onLoad?: () => void;
  onError?: () => void;
  uri?: string | null;
  svgStyle?: StyleProp<ViewStyle>;
} & ViewProps;

export type SvgProps = BaseSvgProps & { svg?: BaseSvg | null };

const StyledSkeleton = styled(Skeleton)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

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
  viewBox,
  onLoad,
  onError,
  svgStyle,
  uri = null,
  ...rest
}: SvgProps) => {
  const theme = useTheme();

  const SvgComponent = SVG || SvgUri;

  const [loading, setLoading] = useState(SvgComponent === SvgUri);

  // Workaround for Jest
  if (typeof SVG === 'number') return <View testID={rest.testID} />;

  const svgFill = fill;
  const svgStroke = stroke;


  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const svgBaseStyle: ViewStyle = {
    overflow: 'hidden',
    opacity: loading ? 0 : 1,
  };

  const content = (
    <View
      style={[{ width: size, aspectRatio }, style]}
      {...rest}
    >
      <StyledSkeleton
        isLoading={loading}
      />
      <SvgComponent
        style={[svgBaseStyle, svgStyle]}
        width="100%"
        height="100%"
        preserveAspectRatio={preserveAspectRatio || 'xMidYMid meet'}
        fill={svgFill}
        stroke={svgStroke}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        color={color || theme.colors.text.primary}
        uri={uri}
        onLoad={handleLoad}
        onError={onError}
        {...(viewBox ? { viewBox } : {})}
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