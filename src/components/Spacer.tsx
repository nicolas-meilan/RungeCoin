import React from 'react';
import { View, StyleProp, ViewStyle, DimensionValue } from 'react-native';

type SpacerProps = {
  size?: DimensionValue;
  fill?: boolean;
  horizontal?: boolean;
};

export const Spacer = ({
  size,
  fill,
  horizontal,
}: SpacerProps) => {
  const style: StyleProp<ViewStyle> = {
    flex: fill ? 1 : 0,
    ...(horizontal ? {
      width: size,
    } : {
      height: size,
    }),
  };
  return <View style={style} />;
};
