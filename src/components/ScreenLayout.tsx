import React from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

type ScreenLayoutProps = {
  children: JSX.Element | JSX.Element[];
};

const ScreenWrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const StyledSafeArea = styled(SafeAreaView)`
  flex: 1;
`;

const ScreenLayout = ({ children }: ScreenLayoutProps) => (
  <ScreenWrapper>
    <StyledSafeArea>
      {children}
    </StyledSafeArea>
  </ScreenWrapper>
);

export default ScreenLayout;