import React from 'react';
import {
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';

import styled from 'styled-components/native';

type CardProps = {
  children: JSX.Element | JSX.Element[];
  withSeparator?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  persistentScrollbar?: boolean;
  full?: boolean;
  touchable?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

const Item = styled.View`
  flex: 1;
  width: 100%;
`;

const TouchableCardWrapper = styled.TouchableOpacity<{
  withoutSeparations: boolean;
  full: boolean;
}>`
  ${({ full }) => (full ? 'flex: 1;' : '')}
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  align-items: flex-start;
  ${({ withoutSeparations, theme }) => (withoutSeparations ? `padding: ${theme.spacing(4)};` : '')}
`;

const CardWrapper = styled.View<{
  withoutSeparations: boolean;
  full: boolean;
}>`
  ${({ full }) => (full ? 'flex: 1;' : '')}
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  align-items: flex-start;
  ${({ withoutSeparations, theme }) => (withoutSeparations ? `padding: ${theme.spacing(4)};` : '')}
`;

const Separator = styled.View`
  background-color: ${({ theme }) => theme.colors.border};
  height: 1px;
`;

const ChildrenItemWrapper = styled.View`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(2)}`};
  justify-content: center;
`;

const Card = ({
  children,
  style,
  contentContainerStyle,
  onPress,
  withSeparator = false,
  scroll = false,
  persistentScrollbar = false,
  full = false,
  touchable = false,
  disabled = false,
}: CardProps) => {

  const withoutSeparations = !withSeparator || !Array.isArray(children);

  const content = withoutSeparations
    ? children : (
      <>
        {children.map((item: JSX.Element, index: number) => (
          <Item key={`CARD_${item.props}_${item.key}_${item.type}_${index}`}>
            {index !== 0 && <Separator />}
            <ChildrenItemWrapper>
              {item}
            </ChildrenItemWrapper>
          </Item>
        ))}
      </>
    );

  const contentConditionalScroll = scroll ? (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      persistentScrollbar={persistentScrollbar}
      nestedScrollEnabled
    >
      {content}
    </ScrollView>
  ) : content;

  return (
    <>
      {touchable ? (
        <TouchableCardWrapper
          withoutSeparations={withoutSeparations}
          style={style}
          full={full}
          onPress={onPress}
          disabled={disabled}
        >
          {contentConditionalScroll}
        </TouchableCardWrapper>
      ) : (
        <CardWrapper
          full={full}
          style={style}
          withoutSeparations={withoutSeparations}
        >
          {contentConditionalScroll}
        </CardWrapper>
      )}
    </>
  );
};

export default Card;
