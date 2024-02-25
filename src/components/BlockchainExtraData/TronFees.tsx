import React, { useEffect, useMemo } from 'react';

import styled, { useTheme } from 'styled-components/native';

import Bandwith from '@components/Bandwith';
import Battery from '@components/Battery';
import Card from '@components/Card';
import Skeleton from '@components/Skeleton';
import LineLayout from '@components/Skeleton/LineLayout';
import { Spacer } from '@components/Spacer';
import Text from '@components/Text';
import useTronAccountResources from '@hooks/useTronAccountResources';
import { localizeNumber } from '@utils/formatter';

const Wrapper = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const CardTitle = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[18]};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledCard = styled(Card)`
  align-items: center;
  justify-content: space-around;
`;

const StyledBattery = styled(Battery)`
  width: 50%;
`;

const StyledSkeleton = styled(Skeleton)`
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 80%;
`;

const SKELETON_HEIGHT = 14;

const TronFees = () => {
  const theme = useTheme();

  const {
    refetchAccountResources,
    accountResources,
    accountResourcesLoading,
  } = useTronAccountResources();

  useEffect(() => {
    if (!accountResources) refetchAccountResources();
  }, []);

  const {
    accountBandwidth,
    accountEnergy,
    totalBandwidth,
    totalEnergy,
    energyPercentage,
    bandwithPercentage,
  } = useMemo(() => ({
    accountBandwidth: localizeNumber((accountResources?.accountBandwidth || 0).toString()),
    accountEnergy: localizeNumber((accountResources?.accountEnergy || 0).toString()),
    totalBandwidth: localizeNumber((accountResources?.totalBandwidth || 0).toString()),
    totalEnergy: localizeNumber((accountResources?.totalEnergy || 0).toString()),
    bandwithPercentage: accountResources?.totalBandwidth
      ? (accountResources?.accountBandwidth || 0) / accountResources.totalBandwidth
      : 0,
    energyPercentage: accountResources?.totalEnergy
      ? (accountResources?.accountEnergy || 0) / accountResources.totalEnergy
      : 0,
  }), [accountResources]);

  const isLoading = useMemo(() => (
    !accountResources && accountResourcesLoading
  ), [accountResourcesLoading, accountResources]);

  const onPress = () => { };

  return (
    <Wrapper>
      <StyledCard
        full
        onPress={onPress}
      >
        <CardTitle text="main.home.blockchainExtraData.energy" />
        <StyledBattery
          percentage={energyPercentage}
          isLoading={isLoading}
        />
        <Spacer size={theme.spacingNative(2)} />
        <StyledSkeleton
          isLoading={isLoading}
          Layout={LineLayout}
          height={SKELETON_HEIGHT}
        >
          <Text
            text={`${localizeNumber(accountEnergy.toString())} / ${localizeNumber(totalEnergy.toString())}`}
          />
        </StyledSkeleton>
      </StyledCard>
      <Spacer size={theme.spacingNative(2)} horizontal />
      <StyledCard
        full
        onPress={onPress}
      >
        <CardTitle text="main.home.blockchainExtraData.bandwith" />
        <Bandwith
          percentage={bandwithPercentage}
          isLoading={isLoading}
        />
        <Spacer size={theme.spacingNative(2)} />
        <StyledSkeleton
          isLoading={isLoading}
          Layout={LineLayout}
          height={SKELETON_HEIGHT}
        >
          <Text
            text={`${localizeNumber(accountBandwidth.toString())} / ${localizeNumber(totalBandwidth.toString())}`}
          />
        </StyledSkeleton>
      </StyledCard>
    </Wrapper>
  );
};

export default TronFees;
