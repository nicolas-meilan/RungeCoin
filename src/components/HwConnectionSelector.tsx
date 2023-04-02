import React, { useMemo } from 'react';

import RadioButton, { Option, RadioButtonProps } from './RadioButton';
import useWalletPublicValues from '@hooks/useWalletPublicValues';

export type HwConnectionSelectorProps = {
  initialized?: boolean;
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
      options={HW_CONNECTION_OPTIONS}
      selected={selected}
      onChange={onChange}
      style={style}
      disabled={disabled}
    />
  );

};

export default HwConnectionSelector;