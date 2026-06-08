import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  Text,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { ITEM_WIDTH, LONG_PRESS_DELAY, TAP_DISTANCE } from './constants';
import { styles } from './styles';
import type { DragGesture, Tile } from './types';
import { getCoordinates, getDirectionalDrag, shouldCompleteMove } from './utils';

interface DraggableTileProps {
  tile: Tile;
  index: number;
  moveTile: (index: number, gesture: DragGesture) => void;
}

const showGestureError = (title: string, error: unknown) => {
  console.error(title, error);
  Alert.alert(title, String(error));
};

export const DraggableTile = ({ tile, index, moveTile }: DraggableTileProps) => {
  const pan = useRef(new Animated.ValueXY(getCoordinates(index))).current;
  const indexRef = useRef(index);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressReady = useRef(false);
  const isDragging = useRef(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    Animated.spring(pan, {
      toValue: getCoordinates(index),
      useNativeDriver: true,
      bounciness: 2,
      speed: 20,
    }).start();
  }, [index, pan]);

  useEffect(
    () => () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    },
    [],
  );

  const resetLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPressReady.current = false;
  };

  const startLongPress = () => {
    resetLongPress();
    longPressTimer.current = setTimeout(() => {
      isLongPressReady.current = true;
      longPressTimer.current = null;
    }, LONG_PRESS_DELAY);
  };

  const snapToIndex = (tileIndex: number) => {
    Animated.spring(pan, {
      toValue: getCoordinates(tileIndex),
      useNativeDriver: true,
      bounciness: 4,
      speed: 16,
    }).start();
  };

  const finishDrag = () => {
    isDragging.current = false;
    resetLongPress();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_event, gesture) =>
        isLongPressReady.current &&
        (Math.abs(gesture.dx) > TAP_DISTANCE || Math.abs(gesture.dy) > TAP_DISTANCE),
      onPanResponderGrant: () => {
        try {
          isDragging.current = true;
          pan.stopAnimation(() => {
            pan.extractOffset();
          });
        } catch (error) {
          showGestureError('Ошибка при захвате (Grant)', error);
        }
      },
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        try {
          pan.setValue(getDirectionalDrag(gesture));
        } catch (error) {
          console.error('Ошибка в onMove', error);
        }
      },
      onPanResponderRelease: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        try {
          pan.flattenOffset();
          const currentIndex = indexRef.current;
          finishDrag();

          if (shouldCompleteMove(gesture)) {
            moveTile(currentIndex, gesture);
            return;
          }

          snapToIndex(currentIndex);
        } catch (error) {
          showGestureError('Ошибка при отпускании', error);
        }
      },
      onPanResponderTerminationRequest: () => !isDragging.current,
      onPanResponderTerminate: () => {
        try {
          pan.flattenOffset();
          finishDrag();
          snapToIndex(indexRef.current);
        } catch (error) {
          showGestureError('Ошибка при отмене жеста', error);
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      onTouchStart={startLongPress}
      onTouchEnd={resetLongPress}
      onTouchCancel={resetLongPress}
      style={[
        styles.tile,
        {
          width: ITEM_WIDTH,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      <Text style={styles.tileText}>{tile.title}</Text>
    </Animated.View>
  );
};
