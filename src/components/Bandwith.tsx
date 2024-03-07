import React, { useEffect } from 'react';
import { ActivityIndicator, LayoutChangeEvent } from 'react-native';

import Animated, {
  createAnimatedPropAdapter,
  interpolateColor,
  processColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from 'styled-components';
import styled from 'styled-components/native';

import Icon from './Icon';

const ANIMATION_DURATION = 1500;
const CIRCLE_WIDTH = 6;
const CIRCLE_SIZE = 60;
const SEMICIRCLE_DIVISOR = 2.5;
const LOADING_SIZE = 22;
const COMPONENT_HEIGHT = ((CIRCLE_SIZE - CIRCLE_WIDTH) / 2) * (1 + (SEMICIRCLE_DIVISOR / 4));

const BandwithWrapper = styled.View`
    height: ${COMPONENT_HEIGHT}px;
    width: ${CIRCLE_SIZE}px;
`;

const StyledSvg = styled(Svg)`
  transform: rotate(162deg);
  height: ${CIRCLE_SIZE}px;
  width: ${CIRCLE_SIZE}px;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  top: 23px;
  left: 6px;
  font-size: 30px;
  color: ${({ theme }) => theme.colors.disabled};
`;

const StyledLoading = styled(ActivityIndicator)`
  position: absolute;
  bottom: 0;
  left: ${(CIRCLE_SIZE / 2) - (LOADING_SIZE / 2)}px;
`;

const PERCENTAGE_THRESHOLD = {
  min: 0.33,
  max: 0.66,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedArrow = Animated.createAnimatedComponent(StyledIcon);


type Point2D = {
  x: number;
  y: number;
};

type BandwithProps = {
  percentage?: number;
  isLoading?: boolean;
};

const Bandwith = ({
  percentage = 0,
  isLoading = false,
}: BandwithProps) => {
  const theme = useTheme();
  const bandwithPercentage = useSharedValue(1);
  const arrowSize = useSharedValue<Point2D | null>(null);
  const bandwithFromToColor = useSharedValue({
    range: [0, 0],
    color: [
      theme.colors.background.primary,
      theme.colors.background.primary,
    ],
  });

  const circleSize = CIRCLE_SIZE / 2;
  const circleRadius = (CIRCLE_SIZE - CIRCLE_WIDTH) / 2;
  const circleLength = circleRadius * 2 * Math.PI;
  const semiCircleLength = circleLength / SEMICIRCLE_DIVISOR;

  const getBandwithColor = (currentPercentage: number) => {
    if (currentPercentage >= PERCENTAGE_THRESHOLD.max) {
      return theme.colors.error;
    }

    if (currentPercentage <= PERCENTAGE_THRESHOLD.min) {
      return theme.colors.success;
    }

    return theme.colors.warning;
  };

  useEffect(() => {
    if (isLoading) return;

    const minPercentage = percentage < 0 ? 0 : percentage;
    const finalPercentage = Math.abs(1 - (percentage > 1 ? 1 : minPercentage));

    bandwithFromToColor.value = {
      range: bandwithPercentage.value < finalPercentage
        ? [bandwithPercentage.value, finalPercentage]
        : [finalPercentage, bandwithPercentage.value],
      color: [
        getBandwithColor(bandwithPercentage.value > finalPercentage ? finalPercentage : bandwithPercentage.value),
        getBandwithColor(bandwithPercentage.value > finalPercentage ? bandwithPercentage.value : finalPercentage),
      ],
    };

    bandwithPercentage.value = withTiming(
      finalPercentage,
      { duration: ANIMATION_DURATION },
    );

  }, [percentage, isLoading]);

  const bandwithColorAdapter = createAnimatedPropAdapter(
    (props) => {
      if (Object.keys(props).includes('stroke')) {
        props.stroke = {
          type: 0,
          payload: processColor(props.stroke),
        };
      }
    },
    ['stroke'],
  );

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: semiCircleLength + ((circleLength - semiCircleLength) * bandwithPercentage.value),
    stroke: interpolateColor(
      bandwithPercentage.value,
      bandwithFromToColor.value.range,
      bandwithFromToColor.value.color,
    ),
  }), null, bandwithColorAdapter);

  const animatedArrowStyle = useAnimatedStyle(() => {
    if (!arrowSize.value) return {};

    const rotationMultiplicator = 180;
    const center: Point2D = {
      x: arrowSize.value.x / 2,
      y: arrowSize.value.y / 2,
    };
    const pivot: Point2D = {
      x: arrowSize.value.x - 6,
      y: arrowSize.value.y / 2,
    };


    return {
      transform: [
        { translateX: pivot.x - center.x },
        { translateY: pivot.y - center.y },
        { rotateZ: `${Math.abs(1 - bandwithPercentage.value) * rotationMultiplicator}deg` },
        { translateX: -(pivot.x - center.x) },
        { translateY: -(pivot.y - center.y) },
      ],
    };
  });

  const onArrowLayout = (event: LayoutChangeEvent) => {
    arrowSize.value = {
      x: event.nativeEvent.layout.width,
      y: event.nativeEvent.layout.height,
    };
  };

  return (
    <BandwithWrapper>
      <StyledSvg>
        <Circle
          strokeLinecap="round"
          fill="none"
          cx={circleSize}
          cy={circleSize}
          r={circleRadius}
          strokeWidth={CIRCLE_WIDTH}
          stroke={theme.colors.background.secondary}
          strokeDasharray={circleLength}
          strokeDashoffset={semiCircleLength}
        />
        <AnimatedCircle
          strokeLinecap="round"
          fill="none"
          cx={circleSize}
          cy={circleSize}
          r={circleRadius}
          strokeWidth={CIRCLE_WIDTH}
          strokeDasharray={circleLength}
          animatedProps={animatedCircleProps}
        />
      </StyledSvg>
      {isLoading ? (
        <StyledLoading color={theme.colors.disabled} size={LOADING_SIZE} />
      ) : (
        <AnimatedArrow
          name="arrow-left-thin"
          style={animatedArrowStyle}
          onLayout={onArrowLayout}
        />
      )}
    </BandwithWrapper>

  );
};

export default Bandwith;
