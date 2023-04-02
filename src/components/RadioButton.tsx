import React, { useMemo } from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

import styled from 'styled-components/native';

import Text, { TextProps } from './Text';

export type Option = {
  label: string;
  value: string;
  labelI18nArgs?: TextProps['i18nArgs'];
};

export type RadioButtonProps = {
  options: Option[];
  label?: string;
  labelI18nArgs?: TextProps['i18nArgs'];
  onChange: (selected: Option) => void;
  style?: StyleProp<ViewStyle>;
  selected?: string;
  disabled?: boolean;
};

const DOT_SIZE = 24;

const OptionWrapper = styled.TouchableOpacity<{ isFirstItem: boolean }>`
  flex-direction: row;
  align-items: center;
  ${({ isFirstItem, theme }) => (isFirstItem ? '' : `
    margin-top: ${theme.spacing(3)};
  `)}
`;

const OptionText = styled(Text)`
  margin-left: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const Label = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const DotBorder = styled.View`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${DOT_SIZE / 2}px;
  width: ${DOT_SIZE}px;
  height: ${DOT_SIZE}px;
  padding: 5px;
`;

const Dot = styled.View<{ selected?: boolean }>`
  flex: 1;
  border-radius: ${DOT_SIZE / 2}px;
  ${({ selected, theme }) => (selected ? `
    background-color: ${theme.colors.info};
  ` : '')}
`;

const RadioButton = ({
  options,
  onChange,
  style,
  labelI18nArgs,
  selected = '',
  label = '',
  disabled = false,
}: RadioButtonProps) => {

  const selectedOptionIndex = useMemo(() => options.findIndex(
    ({ value }) => selected === value,
  ), [options, selected]);

  return (
    <View style={style}>
      {!!label && <Label text={label} i18nArgs={labelI18nArgs} />}
      {options.map((option, index) => (
        <OptionWrapper
          isFirstItem={!index}
          onPress={() => onChange(option)}
          disabled={disabled}
          key={`RADIO_BUTTON_${option.value}_${index}`}
        >
          <DotBorder>
            <Dot selected={index === selectedOptionIndex} />
          </DotBorder>
          <OptionText text={option.label} i18nArgs={option.labelI18nArgs} />
        </OptionWrapper>
      ))}
    </View>
  );

};

export default RadioButton;