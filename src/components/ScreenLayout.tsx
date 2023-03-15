import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';

import { EventMapCore, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import Icon from './Icon';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import Svg from './Svg';
import Text from './Text';
import Title from './Title';
import logo from '@assets/logo.svg';

type Children = JSX.Element | false;
type ScreenLayoutProps = {
  children: Children | Children[];
  scroll?: boolean;
  title?: string;
  bigTitle?: boolean;
  hasBack?: boolean;
  hasFooterBanner?: boolean;
  keyboardAvoidingView?: boolean;
  waitUntilNavigationFinish?: boolean;
  rightIcon?: string;
  rightIconOnBigTitle?: boolean;
  bottomSheetOpened?: boolean;
  onPressRightIcon?: () => void;
  goBack?: () => void;
  refreshControl?: JSX.Element;
};

const ScreenWrapper = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledSafeArea = styled(SafeAreaView)`
  flex: 1;
`;

const StaticLayout = styled.View`
  flex-direction: row;
  width: 100%;
  height: ${({ theme }) => theme.spacing(10)};
`;

const Header = styled(StaticLayout)`
  flex-direction: row;
  align-items: center;
`;

const Footer = styled(StaticLayout)`
  align-items: flex-end;
  justify-content: center;
`;

const HeaderTitle = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[18]};
`;

const FooterText = styled(Text)`
  font-size: ${({ theme }) => theme.fonts.size[16]};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const BaseWrapper = styled.View`
  flex: 1;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const ScrollViewWrapper = styled.ScrollView<{ bottomSheetOpened?: boolean }>`
  flex: 1;
  margin-top: ${({ theme }) => theme.spacing(4)};
  ${({ bottomSheetOpened }) => (bottomSheetOpened ? 'overflow: visible;' : '')}
`;

const LoadingWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const HeaderRightIconWrapper = styled.View`
  flex: 1;
  align-items: flex-end;
  justify-content: center;
`;

const HeaderRightIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.info};
`;

const BigTitleWrapper = styled.View`
  flex-direction: row;
`;

const ScreenLayout = ({
  children,
  title,
  goBack,
  onPressRightIcon,
  rightIcon,
  refreshControl,
  scroll = false,
  hasBack = true,
  hasFooterBanner = false,
  bigTitle = false,
  keyboardAvoidingView = false,
  waitUntilNavigationFinish = false,
  rightIconOnBigTitle = false,
  bottomSheetOpened = false,
}: ScreenLayoutProps) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [canRender, setCanRender] = useState(!waitUntilNavigationFinish);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
    });
    if (!canRender) {
      const navigationListenerSuscription = navigation.addListener('transitionEnd' as keyof EventMapCore<any>, () => {
        setCanRender(true);
        navigationListenerSuscription();
      });
    }

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const hasHeaderTitle = !bigTitle && !!title;
  const hasBigTitle = bigTitle && !!title;
  const hasHeader = hasHeaderTitle || hasBack || (!rightIconOnBigTitle && rightIcon);

  const backAction = goBack ? goBack : () => navigation.goBack();

  const contentContainerStyle = {
    margin: -theme.spacingNative(6),
    padding: theme.spacingNative(6),
    ...(bottomSheetOpened ? { flex: 1 } : {}),
  };

  const contentScrollCondition = scroll
    ? (
      <ScrollViewWrapper
        bottomSheetOpened={bottomSheetOpened}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollViewWrapper>
    ) : <BaseWrapper>{children}</BaseWrapper>;

  const content = keyboardAvoidingView ? (
    <KeyboardAvoidingView>
      {contentScrollCondition}
    </KeyboardAvoidingView>
  ) : contentScrollCondition;

  // TODO better loading (custom skeleton per screen and one by default)
  const loadingScreen = (
    <LoadingWrapper>
      <ActivityIndicator color={theme.colors.info} size={80} />
    </LoadingWrapper>
  );

  return (
    <ScreenWrapper>
      <StyledSafeArea>
        {hasHeader && (
          <Header>
            {hasBack && <Icon onPress={backAction} name="chevron-left" />}
            {hasHeaderTitle && <HeaderTitle text={title} />}
            {rightIcon && !rightIconOnBigTitle && (
              <HeaderRightIconWrapper>
                <HeaderRightIcon onPress={onPressRightIcon} name={rightIcon} />
              </HeaderRightIconWrapper>)}
          </Header>
        )}
        {hasBigTitle && (
          <BigTitleWrapper>
            <Title title={title} />
            {rightIcon && rightIconOnBigTitle && (
              <HeaderRightIconWrapper>
                <HeaderRightIcon onPress={onPressRightIcon} name={rightIcon} />
              </HeaderRightIconWrapper>)}
          </BigTitleWrapper>
        )}
        {canRender ? content : loadingScreen}
        {hasFooterBanner && !isKeyboardOpen && (
          <Footer>
            <FooterText text="common.appName" />
            <Svg svg={logo} size={24} />
          </Footer>
        )}
      </StyledSafeArea>
    </ScreenWrapper>
  );
};

export default ScreenLayout;
