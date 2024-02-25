import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from 'styled-components';
import styled from 'styled-components/native';

import Skeleton from './Skeleton';
import LineLayout from './Skeleton/LineLayout';

const ANIMATION_TIME = 1500;

const HEADER_HEIGHT = 12;
const HEADER_WIDTH = 8;
const BODY_HEIGHT = 36;
const BODY_PADDING = 7;

const PERCENTAGE_THRESHOLD = {
  min: 0.33,
  max: 0.66,
};

const BatteryWrapper = styled.View`
  flex-direction: row;
  width: 100%;
  align-items: center;
`;

const BatteryHeader = styled.View`
  width: ${HEADER_WIDTH}px;
  height: ${HEADER_HEIGHT}px;
  border: 1px solid ${({ theme }) => theme.colors.disabled};
  border-left-width: 0px;
  border-radius: 1px;
`;

const BatteryBody = styled.View`
  height: ${BODY_HEIGHT}px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.disabled};
  border-radius: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${BODY_PADDING}px;
`;

const BatteryPercentage = styled(Animated.View)`
  height: 100%;
  border-radius: ${({ theme }) => theme.spacing(1)};
`;

type BatteryProps = {
  percentage?: number;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const Battery = ({
  percentage = 0,
  isLoading = false,
  style,
}: BatteryProps) => {
  const theme = useTheme();
  const batteryPercentage = useSharedValue(0);
  const batteryFromToColor = useSharedValue({
    range: [0, 0],
    color: [
      theme.colors.background.primary,
      theme.colors.background.primary,
    ],
  });

  const getBatteryColor = (currentPercentage: number) => {
    if (currentPercentage >= PERCENTAGE_THRESHOLD.max) {
      return theme.colors.success;
    }
    if (currentPercentage <= PERCENTAGE_THRESHOLD.min) {
      return theme.colors.error;
    }
    return theme.colors.warning;
  };

  useEffect(() => {
    if (isLoading) return;

    const minPercentage = percentage < 0 ? 0 : percentage;
    const finalPercentage = percentage > 1 ? 1 : minPercentage;
    batteryFromToColor.value = {
      range: batteryPercentage.value < finalPercentage
        ? [batteryPercentage.value, finalPercentage]
        : [finalPercentage, batteryPercentage.value],
      color: [
        getBatteryColor(batteryPercentage.value < finalPercentage ? batteryPercentage.value : finalPercentage),
        getBatteryColor(batteryPercentage.value < finalPercentage ? finalPercentage : batteryPercentage.value),
      ],
    };
    batteryPercentage.value = withTiming(finalPercentage, { duration: ANIMATION_TIME });
  }, [percentage, isLoading]);

  const batteryPercentageAnimatedStyle = useAnimatedStyle(() => ({
    width: `${batteryPercentage.value * 100}%`,
    backgroundColor: interpolateColor(
      batteryPercentage.value,
      batteryFromToColor.value.range,
      batteryFromToColor.value.color,
    ),
  }));

  return (
    <BatteryWrapper style={style}>
      <BatteryBody>
        <Skeleton
          Layout={LineLayout}
          isLoading={isLoading}
          height={BODY_HEIGHT - (BODY_PADDING * 2)}
          width="100%"
        >
          <BatteryPercentage style={batteryPercentageAnimatedStyle} />
        </Skeleton>
      </BatteryBody>
      <BatteryHeader />
    </BatteryWrapper>
  );
};

export default Battery;
