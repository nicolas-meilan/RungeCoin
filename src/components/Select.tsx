import React, { useMemo, useState } from 'react';

import styled, { useTheme } from 'styled-components/native';

import Card from './Card';
import Text from './Text';
import TextInput, { TextInputProps } from './TextInput';
import BottomSheet from '@containers/Bottomsheet';

export interface Option<DataType = undefined> {
  data: DataType;
  value: string;
  label?: string;
  disabled?: boolean;
  svg?: TextInputProps['leftSvg'];
  leftComponent?: TextInputProps['leftComponent'];
}

type SelectProps = {
  options: Option<any>[];
  optionComponent?: (option: Option<any>, selected: boolean) => React.ReactNode;
  selectedComponent?: (option: Option<any>) => React.ReactNode;
  keyExtractor?: (option: Option<any>) => string;
  onChange: (option: Option<any>) => void;
  onOpen?: () => void;
  onClose?: () => void;
  selected?: Option['value'];
  placeholder?: string;
  label?: string;
  fixScreenPadding?: boolean;
  disabled?: boolean;
};

const OptionCard = styled(Card) <{ selected: boolean }>`
  ${({ selected, theme }) => (selected ? `
    border-color; ${theme.colors.success};
  ` : '')}
`;

const OptionText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
`;

const OptionWrapper = styled.TouchableOpacity<{ isFirst: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  margin-top: ${({ theme, isFirst }) => (isFirst
    ? '0' : `${theme.spacing(2)}`)};
`;

const Select = ({
  optionComponent: optionComponentProp,
  keyExtractor,
  onChange,
  onOpen,
  onClose,
  options = [],
  disabled = false,
  selected: selectedValue = '',
  placeholder = '',
  label = '',
}: SelectProps) => {
  const theme = useTheme();

  const [showOptions, setShowOptions] = useState(false);

  const selected = useMemo(() => (
    options.find(({ value }) => value === selectedValue)
  ), [selectedValue]);

  const onPressField = () => {
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
        <OptionText text={currentOption.label || currentOption.value} />
      </OptionCard>
    ));

  return (
    <>
      <TextInput
        onPress={onPressField}
        editable={false}
        value={selected?.label || ''}
        borderColor={showOptions ? theme.colors.primary : ''}
        icon={showOptions ? 'chevron-up' : 'chevron-down'}
        placeholder={placeholder}
        leftSvg={selected?.svg}
        leftComponent={selected?.leftComponent}
        label={label}
        pressDisabled={disabled}
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
