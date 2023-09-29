import React from 'react';
import { View, StyleProp, ViewStyle, DimensionValue } from 'react-native';

type SpacerProps = {
  size?: DimensionValue;
  fill?: boolean;
};

export const Spacer = ({
  size,
  fill,
}: SpacerProps) => {
  const style: StyleProp<ViewStyle> = {
    flex: fill ? 1 : 0,
    height: size,
  };
  return <View style={style} />;
};
