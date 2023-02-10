import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type {
  FlatList,
  LayoutChangeEvent,
  ViewToken,
} from 'react-native';

import styled from 'styled-components/native';

export type CarouselRef = {
  next: () => number;
  prev: () => number;
};

type CarouselProps = {
  items: JSX.Element[];
  auto?: boolean;
  loop?: boolean;
  timePerItem?: number;
  onRenderLastItem?: () => void;
};

const DOT_SIZE = 12;

const Item = styled.View`
  flex: 1;
`;

const Wrapper = styled.View`
  flex: 1;
`;

const CarouselList = styled.FlatList`
`;

const DotsWrapper = styled.View`
  margin-top: ${({ theme }) => theme.spacing(2)};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.View<{ selected: boolean }>`
  margin: 0 ${({ theme }) => theme.spacing(1)};
  background-color: ${({ selected, theme }) => (selected ? theme.colors.info : theme.colors.disabled)};
  width: ${DOT_SIZE}px;
  height: ${DOT_SIZE}px;
  border-radius: ${DOT_SIZE / 2}px;
`;

const Carousel = React.forwardRef(({
  items,
  onRenderLastItem,
  auto = false,
  loop = false,
  timePerItem = 3,
}: CarouselProps,
ref: React.Ref<CarouselRef>) => {
  const listRef = useRef<FlatList>(null);

  const [itemWidth, setItemWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoEnd, setAutoEnd] = useState(!auto);

  const next = (): number => {
    if (currentIndex >= items.length) return currentIndex;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    listRef.current?.scrollToIndex({ animated: true, index: nextIndex });

    return nextIndex;
  };

  const prev = (): number => {
    if (!currentIndex) return currentIndex;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    listRef.current?.scrollToIndex({ animated: true, index: prevIndex });

    return prevIndex;
  };

  useImperativeHandle(ref, () => ({ next, prev }));

  useEffect(() => {
    if (!auto) return () => { };

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex: number) => {
        const nextIndex = prevIndex + 1;
        const maxIndex = items.length - 1;
        if (!loop && maxIndex <= nextIndex) {
          setAutoEnd(true);
          clearInterval(interval);
        }
        if (loop && nextIndex > maxIndex) {
          listRef.current?.scrollToIndex({ animated: true, index: 0 });

          return 0;
        }
        try { // auto enable and manual also enable can overflow the index
          listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
        } catch (_) { }

        return nextIndex;
      });
    }, timePerItem * 1000);

    return () => (interval && clearInterval(interval));
  }, [auto]);

  const renderItem = ({ item }: { item: unknown } ) => (
    <Item style={{ width: itemWidth }}>
      {item as JSX.Element}
    </Item>
  );

  const onListLayout = (event: LayoutChangeEvent) => setItemWidth(event.nativeEvent.layout.width);

  const onChangeItem = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const maxIndex = viewableItems.length - 1;
    setCurrentIndex(viewableItems?.[maxIndex].index || 0);
  }, []);

  return (
    <Wrapper>
      <CarouselList
        horizontal
        ref={listRef}
        showsHorizontalScrollIndicator={false}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `CAROUSEL_${item}_${index}`}
        onLayout={onListLayout}
        snapToInterval={itemWidth}
        onViewableItemsChanged={onChangeItem}
        snapToAlignment='center'
        decelerationRate={0.5}
        scrollEnabled={autoEnd}
        onEndReached={onRenderLastItem}
      />
      <DotsWrapper>
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          const autoAnsScrollOverflow = isLastItem && currentIndex > index;
          const selected = currentIndex === index || autoAnsScrollOverflow;

          return (
            <Dot
              key={`CAROUSEL_DOT_${item}_${index}`}
              selected={selected}
            />
          );
        })}
      </DotsWrapper>
    </Wrapper>
  );
});

export default Carousel;
