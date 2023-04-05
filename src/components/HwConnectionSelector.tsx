import React, { useMemo } from 'react';

import RadioButton, { Option, RadioButtonProps } from './RadioButton';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

export type HwConnectionSelectorProps = {
  initialized?: boolean;
  label?: RadioButtonProps['label'];
  labelI18nArgs?: RadioButtonProps['labelI18nArgs'];
  style?: RadioButtonProps['style'];
  disabled?: RadioButtonProps['disabled'];
};

enum HwConnections {
  USB = 'USB',
  BLUETOOTH = 'BLUETOOTH',
}

const HW_CONNECTION_OPTIONS = [{
  value: HwConnections.USB,
  label: `hw.connectionOptions.${HwConnections.USB}`,
}, {
  value: HwConnections.BLUETOOTH,
  label: `hw.connectionOptions.${HwConnections.BLUETOOTH}`,
}];

const HwConnectionSelector = ({
  style,
  label,
  labelI18nArgs,
  disabled = false,
  initialized = false,
}: HwConnectionSelectorProps) => {
  const {
    walletPublicValues,
    setHwConnection,
  } = useWalletPublicValues();

  const selected = useMemo(() => {
    if (!walletPublicValues) return initialized ? HwConnections.USB : undefined;

    return walletPublicValues.hwConnectedByBluetooth
      ? HwConnections.BLUETOOTH
      : HwConnections.USB;
  }, [walletPublicValues]);

  const onChange = (newOption: Option) => setHwConnection(newOption.value === HwConnections.BLUETOOTH);

  return (
    <RadioButton
      label={label}
      labelI18nArgs={labelI18nArgs}
      options={HW_CONNECTION_OPTIONS}
      selected={selected}
      onChange={onChange}
      style={style}
      disabled={disabled}
    />
  );

};

export default HwConnectionSelector;