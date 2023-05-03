import React, { useEffect, useMemo, useState } from 'react';
import type { ScrollViewProps } from 'react-native';

import styled from 'styled-components/native';

import Pill from './Pill';


type ContentSwitcherProps = {
  labels: string[];
  components: React.ReactNode[];
  initialIndex?: number;
  rightComponent?: React.ReactNode;
  onChange?: (tabIndex: number) => void;
  scroll?: boolean;
  unmountOnHide?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
};

const SWITCHER_HEIGHT = 35;
const ELEVATION_VISIBLE_COMPONENT = 10000;

const SwitcherButtonsWrapper = styled.View`
  flex-direction: row;
  align-self: flex-start;
  height: ${SWITCHER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const PillItem = styled(Pill) <{ selected: boolean }>`
  height: ${SWITCHER_HEIGHT}px;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  ${({ selected, theme }) => (!selected ? `
      border-color: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
    ` : ''
  )}
`;

const Top = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${SWITCHER_HEIGHT}px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledScrollView = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  flex: 1;
`;

const ContentItemWrapper = styled.View<{ visible?: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  z-index: ${({ visible }) => (visible ? ELEVATION_VISIBLE_COMPONENT : -ELEVATION_VISIBLE_COMPONENT)};
  elevation :${({ visible }) => (visible ? ELEVATION_VISIBLE_COMPONENT : -ELEVATION_VISIBLE_COMPONENT)};
`;

const ContentSwitcher = ({
  labels,
  components,
  rightComponent,
  onChange,
  refreshControl,
  unmountOnHide = false,
  scroll = false,
  initialIndex = 0,
}: ContentSwitcherProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [neverChange, setNeverChange] = useState(true);

  useEffect(() => {
    onChange?.(selectedIndex);
  }, [selectedIndex]);

  const switcherItems = useMemo(() => labels.map((label, index) => {
    const key = `SWITCHER_LABEL_${index}_${label}`;

    const handlePress = () => {
      setNeverChange(false);
      setSelectedIndex(index);
    };

    return (
      <PillItem
        key={key}
        selected={selectedIndex === index}
        onPress={handlePress}
        text={label}
        type="info"
      />
    );
  }), [labels, selectedIndex]);

  const cachedComponent = useMemo(() => ({ // cache the first rendered component
    component: components[selectedIndex],
    index: selectedIndex,
  }), [components]);

  const contentToRender = useMemo(() => {
    components[cachedComponent.index] = cachedComponent.component;

    return unmountOnHide || neverChange
      ? components[selectedIndex]
      : (
        <Content>
          {components.map((component, index) => (
            <ContentItemWrapper
              visible={index === selectedIndex}
              key={`CONTENT_SHITCHER_COMPONENT${index}`}
            >
              {component}
            </ContentItemWrapper>
          ))}
        </Content>
      );
  }, [unmountOnHide, neverChange, selectedIndex]);

  const switcherContent = scroll ? (
    <StyledScrollView refreshControl={refreshControl}>
      {contentToRender}
    </StyledScrollView>
  ) : contentToRender;

  if (!switcherItems.length) return <></>;

  return (
    <>
      <Top>
        <SwitcherButtonsWrapper>
          {switcherItems}
        </SwitcherButtonsWrapper>
        {rightComponent}
      </Top>
      {switcherContent}
    </>
  );
};

export default ContentSwitcher;
