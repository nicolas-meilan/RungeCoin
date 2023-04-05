import React from 'react';
import { TouchableOpacity } from 'react-native';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';

import BlockchainSelector from './BlockchainSelector';
import Svg from './Svg';
import defaultTokenIcon from '@assets/defaultTokenIcon.svg';
import { ScreenName } from '@navigation/constants';
import { MainNavigatorType } from '@navigation/MainNavigator';

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(10)};
`;

const SelectWrapper = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(6)};
`;

const ConfigurationSvg = styled(Svg)`
  border-radius: 2000px;
  overflow: hidden;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.statics.black};
`;

const HomeHeader = () => {
  const navigation = useNavigation<NavigationProp<MainNavigatorType>>();

  const onPressConfiguration = () => navigation.navigate(ScreenName.configuration);

  return (
    <Header>
      <SelectWrapper>
        <BlockchainSelector />
      </SelectWrapper>
      <TouchableOpacity onPress={onPressConfiguration}>
        <ConfigurationSvg svg={defaultTokenIcon} size={40} />
      </TouchableOpacity>
    </Header>
  );
};

export default HomeHeader;
