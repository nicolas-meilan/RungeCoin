import React, { useMemo, useState } from 'react';

import styled, { useTheme } from 'styled-components/native';

import Card from './Card';
import Svg from './Svg';
import Text from './Text';
import TextInput, { TextInputProps } from './TextInput';
import BottomSheet from '@containers/Bottomsheet';

export type Option<DataType = undefined> = {
  data: DataType;
  value: string;
  label?: string;
  disabled?: boolean;
  useDisabledItemStyle?: boolean;
  svg?: TextInputProps['leftSvg'];
  leftComponent?: TextInputProps['leftComponent'];
};

export type SelectProps = {
  options: Option<any>[];
  optionComponent?: (option: Option<any>, selected: boolean) => React.ReactNode;
  selectedComponent?: (option: Option<any>) => React.ReactNode;
  keyExtractor?: (option: Option<any>) => string;
  onChange: (option: Option<any>) => void;
  onOpen?: () => void;
  onClose?: () => void;
  selected?: Option['value'];
  style?: TextInputProps['style'];
  placeholder?: string;
  label?: string;
  fixScreenPadding?: boolean;
  useDisabledItemStyle?: boolean;
  disabled?: boolean;
};

const OptionCard = styled(Card) <{ selected: boolean }>`
  flex-direction: row;
  ${({ selected, theme }) => (selected ? `
    border: ${theme.colors.success};
  ` : 'border: 0px')}
`;

const OptionText = styled(Text)<{ hasLeftComponent: boolean }>`
  margin-left: ${({ hasLeftComponent, theme }) => (hasLeftComponent
    ? theme.spacing(2)
    : '0px')};
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const OptionWrapper = styled.TouchableOpacity<{
  isFirst: boolean;
  useDisabledItemStyle?: boolean;
}>`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  opacity: ${({ disabled, useDisabledItemStyle }) => (disabled && useDisabledItemStyle
    ? 0.5 : 1)};
  margin-top: ${({ theme, isFirst }) => (isFirst
    ? '0' : `${theme.spacing(2)}`)};
`;

const Select = ({
  optionComponent: optionComponentProp,
  keyExtractor,
  onChange,
  onOpen,
  onClose,
  style,
  options = [],
  useDisabledItemStyle = false,
  disabled = false,
  selected: selectedValue = '',
  placeholder = '',
  label = '',
}: SelectProps) => {
  const theme = useTheme();

  const [showOptions, setShowOptions] = useState(false);

  const selected = useMemo(() => (
    options.length === 1
      ? options[0]
      : options.find(({ value }) => value === selectedValue)
  ), [selectedValue, options]);

  const selectWithoutOptions = options.length <= 1;

  const onPressField = () => {
    if (selectWithoutOptions) return;

    onOpen?.();
    setShowOptions(true);
  };
  const onCloseOptions = (avoidCallback?: boolean) => {
    if (!avoidCallback) onClose?.();
    setShowOptions(false);
  };

  const handleChange = (currentOption: typeof options[0]) => {
    onChange(currentOption);
    onCloseOptions(true);
  };

  const optionComponent = optionComponentProp || (
    (currentOption: typeof options[0], currentSelected: boolean): React.ReactNode => (
      <OptionCard selected={currentSelected}>
        {currentOption.leftComponent}
        {!currentOption.leftComponent
          && currentOption.svg
          && <Svg svg={currentOption.svg} size={24} />}
        <OptionText
          hasLeftComponent={!!(currentOption.leftComponent || currentOption.svg)}
          text={currentOption.label || currentOption.value}
        />
      </OptionCard>
    ));

  const inputIcon = showOptions ? 'chevron-up' : 'chevron-down';
  return (
    <>
      <TextInput
        onPress={onPressField}
        editable={false}
        value={selected?.label || ''}
        borderColor={showOptions ? theme.colors.primary : ''}
        icon={selectWithoutOptions ? '' : inputIcon}
        placeholder={placeholder}
        leftSvg={selected?.svg}
        leftComponent={selected?.leftComponent}
        label={label}
        pressDisabled={disabled || selectWithoutOptions}
        style={style}
      />
      <BottomSheet
        visible={showOptions}
        onClose={onCloseOptions}
      >
        <Card scroll>
          {options.map((currentOption, index) => (
            <OptionWrapper
              key={`SELECT_ITEM_${currentOption.value}_${keyExtractor?.(currentOption)}`}
              isFirst={!index}
              disabled={currentOption.disabled}
              useDisabledItemStyle={useDisabledItemStyle}
              onPress={() => handleChange(currentOption)}
            >
              {optionComponent(currentOption, selectedValue === currentOption.value)}
            </OptionWrapper>
          ))}
        </Card>
      </BottomSheet>
    </>
  );
};

export default Select;
