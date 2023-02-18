import React from 'react';

import { Rect } from 'react-content-loader/native';

import { LayoutProps } from './types';
import { DEFAULT_BORDER_RADIUS } from '../../theme/themes';

const LineLayout = ({
  height,
  width,
}: LayoutProps) => {

  return (
    <Rect
      rx={DEFAULT_BORDER_RADIUS}
      ry={DEFAULT_BORDER_RADIUS}
      width={width}
      height={height}
    />
  );
};

export default LineLayout;
