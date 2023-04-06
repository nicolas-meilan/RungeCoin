import React, { useMemo } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native';

import ContentLoader from 'react-content-loader/native';
import styled, { useTheme } from 'styled-components/native';

import LineLayout from './LineLayout';
import { LayoutProps } from './types';
import { INPUT_HEIGHT_SMALL } from '../../theme/themes';

type Deps = React.DependencyList | undefined;

type SkeletonBaseProps = {
  Layout?: React.ComponentType<LayoutProps>;
  height?: number;
  width?: number | string;
  style?: StyleProp<ViewStyle>;
  areMultiples?: boolean;
  isFirst?: boolean;
  speed?: number;
};

export type SkeletonProps = Omit<SkeletonBaseProps, 'areMultiples' | 'isFirst'> & {
  children?: React.ReactNode;
  isLoading: boolean;
  requiredValuesToRender?: Deps;
  quantity?: number;
  withScroll?: boolean;
  keyExtractor?: (index: number) => string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const SkeletonContainer = styled.View<{
  height: number;
  width: number | string;
  withSpacing?: boolean;
}>`
  justify-content: flex-end;
  height: ${({ withSpacing, theme, height }) => (withSpacing
    ? height + theme.spacingNative(2)
    : height)}px;
  ${({ withSpacing, theme }) => (withSpacing
    ? `margin-top: ${theme.spacing(2)};`
    : '')}
`;

const SkeletonBase = ({
  Layout = LineLayout,
  height,
  width,
  style,
  speed,
  areMultiples = false,
  isFirst = false,
}: SkeletonBaseProps) => {
  const theme = useTheme();

  const calculatedHeight = height || INPUT_HEIGHT_SMALL;
  const calculatedWidth = width || '100%';

  return (
    <SkeletonContainer
      height={calculatedHeight}
      width={calculatedWidth}
      withSpacing={areMultiples && !isFirst}
      style={style}
    >
      <ContentLoader
        height={calculatedHeight}
        width={calculatedWidth}
        backgroundColor={theme.colors.background.secondary}
        foregroundColor={theme.colors.disabled}
        speed={speed}
      >
        <Layout
          height={calculatedHeight}
          width={calculatedWidth}
        />
      </ContentLoader>
    </SkeletonContainer>
  );
};

const Skeleton = ({
  quantity = 1,
  keyExtractor,
  children,
  isLoading,
  requiredValuesToRender,
  style,
  onLayout,
  withScroll = false,
  ...props
}: SkeletonProps) => {
  const skeletons = useMemo(() => [...new Array(quantity)], [quantity]);

  const allRequiredValuesAreOk: boolean = useMemo(() => (requiredValuesToRender
    ? requiredValuesToRender?.every((value) => !!value)
    : true
  ), [requiredValuesToRender]);

  const loading = isLoading || !allRequiredValuesAreOk;

  if (!loading) return <>{children}</>;

  const content = skeletons.map((_, index) => (
    <SkeletonBase
      areMultiples={quantity > 1}
      isFirst={!index}
      key={keyExtractor?.(index) || `SKELETON_ITEM_${index}`}
      {...props}
    />
  ));

  if (withScroll) {
    return (
      <ScrollView
        nestedScrollEnabled
        style={style}
        onLayout={onLayout}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={style} onLayout={onLayout}>
      {content}
    </View>
  );
};

export default Skeleton;