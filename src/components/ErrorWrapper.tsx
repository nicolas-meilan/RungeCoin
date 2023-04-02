import React, { useMemo } from 'react';

import styled from 'styled-components/native';

import Card, { CardProps } from './Card';
import Icon from './Icon';
import Text from './Text';


type ErrorWrapperProps = {
  children: React.ReactNode;
  requiredValuesToRender: any[];
  isLoading?: boolean;
  errorComponent?: React.ReactNode;
  retryCallback?: () => void;
  title?: string;
  message?: string;
  height?: number;
  style?: CardProps['style'];
};

const ErrorCard = styled(Card)<{ height?: number }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  ${({ height }) => (height
    ? `height: ${height}px;`
    : '')}
`;

const ErrorTitle = styled(Text)`
    font-size: ${({ theme }) => theme.fonts.size[16]};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled(Text)`
    font-size: ${({ theme }) => theme.fonts.size[14]};
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ErrorWrapper = ({
  children,
  requiredValuesToRender,
  errorComponent,
  retryCallback,
  height,
  style,
  title = '',
  message = '',
  isLoading = false,
}: ErrorWrapperProps) => {
  const hasErrorRequiredValues = useMemo(() => (
    requiredValuesToRender.some((item) => item === null || item === undefined)
  ), [requiredValuesToRender]);

  const renderMessage = !!retryCallback || !!message;

  return (
    <>
      {!isLoading && hasErrorRequiredValues
        ? (
          <>
            {errorComponent || (
              <ErrorCard height={height} style={style}>
                <ErrorTitle text={title || 'error.title'} />
                {renderMessage && <ErrorMessage text={message || 'error.message'} />}
                {!!retryCallback && <Icon name="reload" onPress={retryCallback} />}
              </ErrorCard>
            )}
          </>
        )
        : (children)}
    </>
  );
};

export default ErrorWrapper;
