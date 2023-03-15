import React from 'react';

import { Rect } from 'react-content-loader/native';

import type { LayoutProps } from './types';
import { DEFAULT_BORDER_RADIUS } from '../../theme/themes';

const QUANTITY = 10;
const ITEM_WIDTH = 15;

const CandlesChartLayout = ({
  height,
  width: widthProp,
}: LayoutProps) => {
  const width = typeof widthProp === 'string' ? 0 : widthProp; // cannot use string %
  const spacing = (width - (QUANTITY * ITEM_WIDTH)) / (QUANTITY - 1);

  const rectangles = [...Array(QUANTITY).keys()].map((value) => {
    const randomHeightMin = 0.3 * height;
    const randomHeight = Math.random() * (height - randomHeightMin) + randomHeightMin;

    const maxPositionOffset = (height - randomHeight);
    const randomPosition = Math.random() * maxPositionOffset;

    return (
      <Rect
        key={value}
        x={value * (spacing + ITEM_WIDTH)}
        y={height - randomHeight - randomPosition}
        width={ITEM_WIDTH}
        height={randomHeight}
        rx={DEFAULT_BORDER_RADIUS}
        ry={DEFAULT_BORDER_RADIUS}
      />
    );
  });

  return (
    <>
      {rectangles}
    </>
  );
};

export default CandlesChartLayout;
