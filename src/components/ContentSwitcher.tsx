import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components/native';

import Pill, { Type } from './Pill';


type ContentSwitcherProps = {
  labels: string[];
  components: React.ReactNode[];
  initialIndex?: number;
  rightComponent?: React.ReactNode;
  onChange?: (tabIndex: number) => void;
};

const SWITCHER_HEIGHT = 35;

const SwitcherButtonsWrapper = styled.View`
  flex-direction: row;
  align-self: flex-start;
  height: ${SWITCHER_HEIGHT}px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const PillItem = styled(Pill)<{ selected: boolean }>`
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

const ContentSwitcher = ({
  labels,
  components,
  rightComponent,
  onChange,
  initialIndex = 0,
}: ContentSwitcherProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [neverChange, setNeverChange] = useState(true);

  useEffect(() => {
    if (neverChange) return;

    onChange?.(selectedIndex);
  }, [selectedIndex, neverChange]);

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
        type={Type.INFO}
      />
    );
  }), [labels, selectedIndex]);

  if (!switcherItems.length) return <></>;

  return (
    <>
      <Top>
        <SwitcherButtonsWrapper>
          {switcherItems}
        </SwitcherButtonsWrapper>
        {rightComponent}
      </Top>
      {components[selectedIndex]}
    </>
  );
};

export default ContentSwitcher;
