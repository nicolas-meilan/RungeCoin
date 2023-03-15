import React, { useMemo } from 'react';
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';

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
};

type Children = false | JSX.Element;

export type SkeletonProps = Omit<SkeletonBaseProps, 'areMultiples' | 'isFirst'> & {
  children?: Children | Children[];
  isLoading: boolean;
  requiredValuesToRender?: Deps;
  quantity?: number;
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
  ...props
}: SkeletonProps) => {
  const skeletons = useMemo(() => [...new Array(quantity)], [quantity]);

  const allRequiredValuesAreOk: boolean = useMemo(() => (requiredValuesToRender
    ? requiredValuesToRender?.every((value) => !!value)
    : true
  ), [requiredValuesToRender]);

  const loading = isLoading || !allRequiredValuesAreOk;

  if (!loading) return <>{children}</>;

  return (
    <View style={style} onLayout={onLayout}>
      {skeletons.map((_, index) => (
        <SkeletonBase
          areMultiples={quantity > 1}
          isFirst={!index}
          key={keyExtractor?.(index) || `SKELETON_ITEM_${index}`}
          {...props}
        />
      ))}
    </View>
  );
};

export default Skeleton;