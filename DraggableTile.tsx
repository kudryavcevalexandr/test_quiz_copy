import React, { useEffect, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { ITEM_WIDTH } from './constants';
import { styles } from './styles';
import type { DragGesture } from './types';
import { getCoordinates, getDirectionalDrag, shouldCompleteMove } from './utils';

interface DraggableTileProps {
  tile: number;
  index: number;
  moveTile: (index: number, gesture: DragGesture) => void;
  isSolved: boolean;
}

export const DraggableTile = ({ tile, index, moveTile, isSolved }: DraggableTileProps) => {
  const pan = useRef(new Animated.ValueXY(getCoordinates(index))).current;
  const indexRef = useRef(index);
  const isSolvedRef = useRef(isSolved);

  useEffect(() => {
    indexRef.current = index;
    isSolvedRef.current = isSolved;
  }, [index, isSolved]);

  useEffect(() => {
    Animated.spring(pan, {
      toValue: getCoordinates(index),
      useNativeDriver: true,
      bounciness: 2,
      speed: 20,
    }).start();
  }, [index, pan]);

  const snapToIndex = (tileIndex: number) => {
    Animated.spring(pan, {
      toValue: getCoordinates(tileIndex),
      useNativeDriver: true,
      bounciness: 4,
      speed: 16,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSolvedRef.current,
      onMoveShouldSetPanResponder: () => !isSolvedRef.current,
      onPanResponderGrant: () => {
        pan.stopAnimation(() => {
          pan.extractOffset();
        });
      },
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        pan.setValue(getDirectionalDrag(gesture));
      },
      onPanResponderRelease: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        pan.flattenOffset();

        const currentIndex = indexRef.current;

        if (shouldCompleteMove(gesture)) {
          moveTile(currentIndex, gesture);
          return;
        }

        snapToIndex(currentIndex);
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        snapToIndex(indexRef.current);
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tile,
        {
          width: ITEM_WIDTH,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      <Text style={styles.tileText}>{tile}</Text>
    </Animated.View>
  );
};
